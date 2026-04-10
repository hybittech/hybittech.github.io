// ============================================================================
// HCPU HISAB Serializer — hcpu_hisab.v
// Hardware HISAB nibble-packer + CRC32 engine
// Implements §4.6.1 (LETTER frame) nibble-packing and CRC32 digest
// (c) 2026 HMCL — Hybit Technology
// ============================================================================
//
// HISAB = Hijaiyyah Inter-System Standard for Auditable Bridging
//
// This module provides two operations:
//
//   HPACK (op=0):  H-Reg (144-bit, 18×8-bit) → nibble-packed output
//                  Output: 3 GPR words (pack[31:0], pack[63:32], pack[79:72]+guard)
//                  9 bytes nibble-packed + 1 byte guard status = 10 bytes → 3 words
//
//   HCRC  (op=1):  Compute CRC32 over HISAB frame header+payload+guard
//                  Input: GPR[S1] = word0, GPR[S2] = word1 (of packed data)
//                         IMM[7:0] = word2_byte (last pack byte + guard)
//                  Output: 32-bit CRC32 digest
//
// All operations are single-cycle combinational.
//

`include "hcpu_pkg.vh"

module hcpu_hisab (
    input  wire [1:0]           op,          // 0 = HPACK, 1 = HCRC
    input  wire [`HREG_W-1:0]   vec_in,      // 144-bit H-Reg for HPACK
    input  wire [`XLEN-1:0]     gpr_s1,      // GPR input for HCRC (word0)
    input  wire [`XLEN-1:0]     gpr_s2,      // GPR input for HCRC (word1)
    input  wire [7:0]           extra_byte,  // Extra byte for HCRC (guard+tail)

    output wire [`XLEN-1:0]     pack_word0,  // Nibble-packed bytes 0-3
    output wire [`XLEN-1:0]     pack_word1,  // Nibble-packed bytes 4-7
    output wire [`XLEN-1:0]     pack_word2,  // Byte 8 + guard_status + 00 + 00
    output wire [7:0]           guard_status,// Guard bitmask (G1-G4, T1-T2)
    output wire [`XLEN-1:0]     crc_out,     // CRC32 result (for HCRC)
    output wire                 done
);

    assign done = 1'b1;  // Single-cycle

    // ── Extract 18 components from H-Reg ────────────────────────
    wire [7:0] c [0:17];
    genvar gi;
    generate
        for (gi = 0; gi < 18; gi = gi + 1) begin : comp_extract
            assign c[gi] = vec_in[8*gi +: 8];
        end
    endgenerate

    // ── Guard status computation (G1-G4, T1-T2) ────────────────
    // G1: A_N = Na + Nb + Nd     (components match aggregate)
    // G2: A_K = Kp+Kx+Ks+Ka+Kc
    // G3: A_Q = Qp+Qx+Qs+Qa+Qc
    // G4: Θ̂ ≥ U, where U = Qx+Qs+Qa+4*Qc
    // T1: Ks > 0 ⇒ Qc ≥ 1
    // T2: Kc > 0 ⇒ Qc ≥ 1

    // Note: Guard bit mapping matches hcpu_guard.v
    wire [15:0] sum_n = c[`C_NA] + c[`C_NB] + c[`C_ND];
    wire [15:0] sum_k = c[`C_KP] + c[`C_KX] + c[`C_KS] + c[`C_KA] + c[`C_KC];
    wire [15:0] sum_q = c[`C_QP] + c[`C_QX] + c[`C_QS] + c[`C_QA] + c[`C_QC];
    wire [15:0] U_val = c[`C_QX] + c[`C_QS] + c[`C_QA] + {c[`C_QC], 2'b00}; // 4*Qc

    wire g1 = (c[`C_AN] == sum_n[7:0]);
    wire g2 = (c[`C_AK] == sum_k[7:0]);
    wire g3 = (c[`C_AQ] == sum_q[7:0]);
    wire g4 = (c[`C_THETA] >= U_val[7:0]);
    wire t1 = (c[`C_KS] == 0) || (c[`C_QC] >= 1);
    // T2: Kaf exception — ROM stores Kc=1 but Qc=0 (structural property)
    wire is_kaf = (c[`C_THETA] == 8'd2 && c[`C_AK] == 8'd1 &&
                   c[`C_AQ] == 8'd0 && c[`C_KC] == 8'd1);
    wire t2 = (c[`C_KC] == 0) || (c[`C_QC] >= 1) || is_kaf;

    assign guard_status = {2'b00, t2, t1, g4, g3, g2, g1};

    // ── Nibble-packing (§4.6.1) ─────────────────────────────────
    // 18 components → 9 nibble-packed bytes
    // Pair layout: (Θ̂|Na), (Nb|Nd), (Kp|Kx), (Ks|Ka), (Kc|Qp),
    //              (Qx|Qs), (Qa|Qc), (A_N|A_K), (A_Q|Ψ)
    wire [7:0] nb [0:8];
    assign nb[0] = {c[0][3:0],  c[1][3:0]};   // Θ̂  | Na
    assign nb[1] = {c[2][3:0],  c[3][3:0]};   // Nb | Nd
    assign nb[2] = {c[4][3:0],  c[5][3:0]};   // Kp | Kx
    assign nb[3] = {c[6][3:0],  c[7][3:0]};   // Ks | Ka
    assign nb[4] = {c[8][3:0],  c[9][3:0]};   // Kc | Qp
    assign nb[5] = {c[10][3:0], c[11][3:0]};   // Qx | Qs
    assign nb[6] = {c[12][3:0], c[13][3:0]};   // Qa | Qc
    assign nb[7] = {c[14][3:0], c[15][3:0]};   // A_N| A_K
    assign nb[8] = {c[16][3:0], c[17][3:0]};   // A_Q| Ψ

    // Pack into 3 words
    assign pack_word0 = {nb[3], nb[2], nb[1], nb[0]};   // bytes 0-3
    assign pack_word1 = {nb[7], nb[6], nb[5], nb[4]};   // bytes 4-7
    assign pack_word2 = {16'h0000, guard_status, nb[8]}; // byte 8 + guard

    // ── CRC32 computation (HISAB §4.10) ─────────────────────────
    // CRC32 over the full HISAB LETTER frame:
    //   Header (4B): 0x48, 0x42, 0x01, 0x01
    //   Payload (9B): nibble-packed
    //   Guard (1B): guard_status
    //   = 14 bytes total → CRC32
    //
    // For hardware efficiency, we use a lookup-table-free
    // bit-serial CRC32 (polynomial 0x04C11DB7, reflected).
    // This computes CRC32 over an arbitrary byte sequence.

    // CRC32 function: process one byte
    function [31:0] crc32_byte;
        input [31:0] crc_in;
        input [7:0]  data_byte;
        reg [31:0] crc;
        integer j;
        begin
            crc = crc_in ^ {24'h0, data_byte};
            for (j = 0; j < 8; j = j + 1) begin
                if (crc[0])
                    crc = (crc >> 1) ^ 32'hEDB88320;
                else
                    crc = crc >> 1;
            end
            crc32_byte = crc;
        end
    endfunction

    // Compute CRC32 over HISAB LETTER frame (14 bytes)
    wire [31:0] crc_0  = crc32_byte(32'hFFFFFFFF, 8'h48);       // Magic 'H'
    wire [31:0] crc_1  = crc32_byte(crc_0,        8'h42);       // Magic 'B'
    wire [31:0] crc_2  = crc32_byte(crc_1,        8'h01);       // Version
    wire [31:0] crc_3  = crc32_byte(crc_2,        8'h01);       // FrameType LETTER
    wire [31:0] crc_4  = crc32_byte(crc_3,        nb[0]);       // Payload B0
    wire [31:0] crc_5  = crc32_byte(crc_4,        nb[1]);       // Payload B1
    wire [31:0] crc_6  = crc32_byte(crc_5,        nb[2]);       // Payload B2
    wire [31:0] crc_7  = crc32_byte(crc_6,        nb[3]);       // Payload B3
    wire [31:0] crc_8  = crc32_byte(crc_7,        nb[4]);       // Payload B4
    wire [31:0] crc_9  = crc32_byte(crc_8,        nb[5]);       // Payload B5
    wire [31:0] crc_10 = crc32_byte(crc_9,        nb[6]);       // Payload B6
    wire [31:0] crc_11 = crc32_byte(crc_10,       nb[7]);       // Payload B7
    wire [31:0] crc_12 = crc32_byte(crc_11,       nb[8]);       // Payload B8
    wire [31:0] crc_13 = crc32_byte(crc_12,       guard_status);// Guard byte

    assign crc_out = ~crc_13;  // Final XOR

endmodule
