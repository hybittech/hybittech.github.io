// ============================================================================
// HCPU Pipeline Controller — hcpu_controller.v  (v2.0)
// Global stall/flush management, hazard resolution, halt detection
// (c) 2026 HMCL — Hybit Technology
// ============================================================================
//
// Stall policy:
//   - PRINT instruction → stall entire pipeline until UART tx_busy deasserts
//   - Load-use hazard   → stall front-end (PC+IF), bubble into EX
//   - Store-load hazard → stall front-end (PC+IF), bubble into EX
//
// Flush policy:
//   - Taken branch/jump → flush IF and ID stages (1-cycle penalty)
//
// Halt:
//   - HALT instruction reaches writeback → assert halted, freeze everything
//

`include "hcpu_pkg.vh"

module hcpu_controller (
    input  wire        clk,
    input  wire        rst_n,

    // ── Instruction info from decode/execute ────────────────────
    input  wire        ex_is_print,
    input  wire        branch_taken,
    input  wire        wb_halt,

    // ── Dependency info ─────────────────────────────────────────
    input  wire        load_use_hazard,
    input  wire        store_load_hazard,

    // ── UART status ─────────────────────────────────────────────
    input  wire        uart_busy,

    // ── Pipeline control outputs ────────────────────────────────
    output wire        pc_stall,       // Freeze Fetch (PC + IF/ID)
    output wire        id_stall,       // Freeze Decode (ID/EX)
    output wire        ex_stall,       // Freeze EX/MEM/WB 
    output wire        if_flush,       // Flush IF/ID (insert NOP to Decode)
    output wire        id_flush,       // Flush ID/EX (insert bubble directly)
    output reg         halted          // Processor halted
);

    // ── PRINT blocking stall ────────────────────────────────────
    // When a PRINT is in the execute stage AND uart is busy,
    // stall the entire pipeline.
    reg print_pending;

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            print_pending <= 1'b0;
        end else begin
            if (ex_is_print && !print_pending)
                print_pending <= 1'b1;
            else if (print_pending && !uart_busy)
                print_pending <= 1'b0;
        end
    end

    // ── Halt latch ──────────────────────────────────────────────
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n)
            halted <= 1'b0;
        else if (wb_halt)
            halted <= 1'b1;
    end

    // ── Global Stall: UART blocking OR halted ───────────────────
    wire global_stall = (print_pending && uart_busy) || halted;

    // ── Front-end Hazard Stall ──────────────────────────────────
    // Load-use and store-load hazards use the same mechanism:
    //   - Freeze PC + IF (hold current instruction in fetch)
    //   - Flush decode → NOP into ID/EX pipeline register
    //   - Decode is NOT stalled so the LOAD flows from ID → EX
    //   - EX is NOT stalled so the current EX instruction → MEM
    wire data_hazard = load_use_hazard || store_load_hazard;

    // ── Pipeline Control Equations ──────────────────────────────
    assign pc_stall = global_stall || data_hazard;
    assign id_stall = global_stall;
    assign ex_stall = global_stall;

    // ── Flushes ─────────────────────────────────────────────────
    // branch_taken: flush IF/ID and ID/EX (kill speculative path)
    // data_hazard:  flush ID/EX only (insert 1-cycle bubble into EX)
    assign if_flush = branch_taken && !global_stall;
    assign id_flush = (branch_taken || data_hazard) && !global_stall;

endmodule
