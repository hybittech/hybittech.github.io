// ============================================================================
// HCPU Fetch Stage — hcpu_fetch.v  (v2.0 — FPGA-safe)
// Instruction fetch with BRAM latency compensation
// (c) 2026 HMCL — Hybit Technology
// ============================================================================
//
// FPGA BRAM returns data 1 cycle AFTER address is presented.
// This module implements a 2-phase fetch to align simulation and hardware:
//
//   Cycle N:   PC drives imem_addr
//   Cycle N+1: imem_data is valid → latch into if_instruction
//
// A 1-bit valid flag tracks when the fetched data is ready to latch.
// On reset/flush/branch, the valid flag is cleared so the stale data
// from the BRAM is discarded (1 bubble cycle).
//

`include "hcpu_pkg.vh"

module hcpu_fetch (
    input  wire                        clk,
    input  wire                        rst_n,

    // ── Pipeline control ────────────────────────────────────────
    input  wire                        stall,      // Hold PC + instruction
    input  wire                        flush,      // Insert NOP

    // ── Branch/Jump from Execute ────────────────────────────────
    input  wire                        branch_taken,
    input  wire [`XLEN-1:0]            branch_target,

    // ── Code memory interface ───────────────────────────────────
    output wire [`CODE_ADDR_W-1:0]     imem_addr,
    output wire                        imem_ce,     // BRAM clock-enable (hold during stall)
    input  wire [`ILEN-1:0]            imem_data,

    // ── Output to Decode ────────────────────────────────────────
    output reg  [`ILEN-1:0]            if_instruction,
    output reg  [`XLEN-1:0]            if_pc         // PC of this instruction
);

    // ── PC register ─────────────────────────────────────────────
    reg [`XLEN-1:0] pc;
    reg [`XLEN-1:0] pc_prev;    // PC that was sent to IMEM last cycle
    reg              fetch_valid; // 1 = imem_data corresponds to pc_prev

    // Drive instruction memory address from PC
    assign imem_addr = pc[`CODE_ADDR_W-1:0];

    // BRAM clock enable: disable during stall to preserve in-flight data
    assign imem_ce = !stall;

    // ── PC update + pipeline register ───────────────────────────
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            pc             <= {`XLEN{1'b0}};
            pc_prev        <= {`XLEN{1'b0}};
            fetch_valid    <= 1'b0;
            if_instruction <= {`OP_NOP, 24'h000000};
            if_pc          <= {`XLEN{1'b0}};
        end else if (flush || branch_taken) begin
            // ── Redirect: discard in-flight fetch, insert NOP ────
            if_instruction <= {`OP_NOP, 24'h000000};
            if_pc          <= {`XLEN{1'b0}};
            fetch_valid    <= 1'b0;  // Next cycle's imem_data will be stale
            if (branch_taken)
                pc <= branch_target;
            // else: flush without redirect keeps PC
        end else if (stall) begin
            // ── Stall: hold everything ──────────────────────────
            // PC, if_instruction, if_pc, fetch_valid all unchanged
        end else begin
            if (fetch_valid) begin
                // ── Normal: BRAM data is valid, latch instruction ─
                if_instruction <= imem_data;
                if_pc          <= pc_prev;
                pc             <= pc + 1;
                pc_prev        <= pc;
                // fetch_valid stays 1 (continuous fetch)
            end else begin
                // ── Warming up: BRAM data not yet valid ──────────
                // Insert NOP while waiting for first valid read
                if_instruction <= {`OP_NOP, 24'h000000};
                if_pc          <= {`XLEN{1'b0}};
                pc_prev        <= pc;
                pc             <= pc + 1;
                fetch_valid    <= 1'b1;  // Next cycle will have valid data
            end
        end
    end

endmodule
