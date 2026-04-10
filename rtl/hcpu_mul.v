// ============================================================================
// HCPU Shift-Add Multiplier — hcpu_mul.v
// ASIC-safe 32×32→32 unsigned multiplier (lower 32 bits only)
// (c) 2026 HMCL — Hybit Technology
// ============================================================================
//
// Replaces Verilog `*` operator which infers DSP48 on FPGA but causes
// gate explosion on ASIC (SKY130). This is a purely combinational
// implementation using shift-and-add.
//
// For FPGA: set parameter USE_DSP = 1 to use the `*` operator instead.
// For ASIC: set parameter USE_DSP = 0 (default) to use shift-add.
//

module hcpu_mul #(
    parameter USE_DSP = 0   // 0 = shift-add (ASIC), 1 = `*` operator (FPGA)
)(
    input  wire [31:0] a,
    input  wire [31:0] b,
    output wire [31:0] result   // Lower 32 bits of a × b
);

generate
    if (USE_DSP) begin : gen_dsp
        // ── FPGA path: infer DSP48 ─────────────────────────────
        assign result = a * b;
    end else begin : gen_shift_add
        // ── ASIC path: shift-add tree ──────────────────────────
        // Compute partial products and sum them
        wire [31:0] pp [0:31];  // Partial products (lower 32 bits only)

        genvar i;
        for (i = 0; i < 32; i = i + 1) begin : gen_pp
            assign pp[i] = b[i] ? (a << i) : 32'd0;
        end

        // 5-level adder tree to sum 32 partial products
        // Level 1: 32 → 16
        wire [31:0] s1 [0:15];
        for (i = 0; i < 16; i = i + 1) begin : gen_s1
            assign s1[i] = pp[2*i] + pp[2*i+1];
        end

        // Level 2: 16 → 8
        wire [31:0] s2 [0:7];
        for (i = 0; i < 8; i = i + 1) begin : gen_s2
            assign s2[i] = s1[2*i] + s1[2*i+1];
        end

        // Level 3: 8 → 4
        wire [31:0] s3 [0:3];
        for (i = 0; i < 4; i = i + 1) begin : gen_s3
            assign s3[i] = s2[2*i] + s2[2*i+1];
        end

        // Level 4: 4 → 2
        wire [31:0] s4 [0:1];
        for (i = 0; i < 2; i = i + 1) begin : gen_s4
            assign s4[i] = s3[2*i] + s3[2*i+1];
        end

        // Level 5: 2 → 1
        assign result = s4[0] + s4[1];
    end
endgenerate

endmodule
