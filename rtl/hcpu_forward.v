// ============================================================================
// HCPU Forwarding Unit — hcpu_forward.v
// Data hazard resolution via EX→ID and MEM→ID bypass MUXes
// (c) 2026 HMCL — HM-28-v1.2-HC18D / Tier 1.5
// ============================================================================
//
// Forwarding paths:
//   EX→ID:  Result from Execute stage forwarded to Decode read values
//   MEM→ID: Result from Memory stage forwarded to Decode read values
//
// Priority: EX forward > MEM forward > register file read
// (EX has newer data if both match)
//
// This module is purely combinational — no clock needed.
//

`include "hcpu_pkg.vh"

module hcpu_forward (
    // ── Decode stage source registers ────────────────────────────
    input  wire [3:0]              id_s1,          // Source 1 register index
    input  wire [3:0]              id_s2,          // Source 2 register index

    // ── Register file read values (default) ─────────────────────
    input  wire [`XLEN-1:0]        rf_gpr_s1,      // GPR[S1] from regfile
    input  wire [`XLEN-1:0]        rf_gpr_s2,      // GPR[S2] from regfile
    input  wire [`HREG_W-1:0]      rf_hreg_s1,     // H-Reg[S1] from regfile
    input  wire [`HREG_W-1:0]      rf_hreg_s2,     // H-Reg[S2] from regfile

    // ── Execute stage forward ───────────────────────────────────
    input  wire                    ex_gpr_we,       // EX writes GPR
    input  wire                    ex_hreg_we,      // EX writes H-Reg
    input  wire [3:0]              ex_dst,          // EX destination register
    input  wire [`XLEN-1:0]        ex_gpr_result,   // EX GPR result
    input  wire [`HREG_W-1:0]      ex_hreg_result,  // EX H-Reg result

    // ── Memory stage forward ────────────────────────────────────
    input  wire                    mem_gpr_we,      // MEM writes GPR
    input  wire                    mem_hreg_we,     // MEM writes H-Reg
    input  wire [3:0]              mem_dst,         // MEM destination register
    input  wire [`XLEN-1:0]        mem_gpr_result,  // MEM GPR result
    input  wire [`HREG_W-1:0]      mem_hreg_result, // MEM H-Reg result

    // ── Forwarded output values ─────────────────────────────────
    output reg  [`XLEN-1:0]        fwd_gpr_s1,      // Final GPR S1 value
    output reg  [`XLEN-1:0]        fwd_gpr_s2,      // Final GPR S2 value
    output reg  [`HREG_W-1:0]      fwd_hreg_s1,     // Final H-Reg S1 value
    output reg  [`HREG_W-1:0]      fwd_hreg_s2      // Final H-Reg S2 value
);

    // ── GPR S1 forwarding ───────────────────────────────────────
    always @(*) begin
        if (ex_gpr_we && ex_dst == id_s1)
            fwd_gpr_s1 = ex_gpr_result;       // EX forward (highest priority)
        else if (mem_gpr_we && mem_dst == id_s1)
            fwd_gpr_s1 = mem_gpr_result;      // MEM forward
        else
            fwd_gpr_s1 = rf_gpr_s1;           // Register file
    end

    // ── GPR S2 forwarding ───────────────────────────────────────
    always @(*) begin
        if (ex_gpr_we && ex_dst == id_s2)
            fwd_gpr_s2 = ex_gpr_result;
        else if (mem_gpr_we && mem_dst == id_s2)
            fwd_gpr_s2 = mem_gpr_result;
        else
            fwd_gpr_s2 = rf_gpr_s2;
    end

    // ── H-Reg S1 forwarding ─────────────────────────────────────
    always @(*) begin
        if (ex_hreg_we && ex_dst == id_s1)
            fwd_hreg_s1 = ex_hreg_result;
        else if (mem_hreg_we && mem_dst == id_s1)
            fwd_hreg_s1 = mem_hreg_result;
        else
            fwd_hreg_s1 = rf_hreg_s1;
    end

    // ── H-Reg S2 forwarding ─────────────────────────────────────
    always @(*) begin
        if (ex_hreg_we && ex_dst == id_s2)
            fwd_hreg_s2 = ex_hreg_result;
        else if (mem_hreg_we && mem_dst == id_s2)
            fwd_hreg_s2 = mem_hreg_result;
        else
            fwd_hreg_s2 = rf_hreg_s2;
    end

endmodule
