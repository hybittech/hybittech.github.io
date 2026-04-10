// ============================================================================
// HCPU Data RAM — hcpu_dataram.v
// Synchronous read/write data memory for LOAD/STORE instructions
// (c) 2026 HMCL — HM-28-v1.2-HC18D / Tier 1.5
// ============================================================================
//
// Interface: Single-port synchronous RAM
//   - Write: data written on rising clock edge when we=1
//   - Read:  combinational read (async) for single-cycle LOAD
//
// Address space: 4096 × 32-bit words = 16 KB
// FPGA: Should infer BRAM on both Gowin and Xilinx
//

`include "hcpu_pkg.vh"

module hcpu_dataram (
    input  wire                     clk,
    input  wire                     we,            // Write enable
    input  wire [`DATA_ADDR_W-1:0]  addr,          // Address (12 bits)
    input  wire [`XLEN-1:0]         wdata,         // Write data
    output wire [`XLEN-1:0]         rdata          // Read data (combinational)
);

    // ── Memory array ────────────────────────────────────────────
    // synthesis: should infer block RAM
    reg [`XLEN-1:0] mem [0:`DATA_DEPTH-1];

    // ── Synchronous write ───────────────────────────────────────
    always @(posedge clk) begin
        if (we)
            mem[addr] <= wdata;
    end

    // ── Combinational read ──────────────────────────────────────
    assign rdata = mem[addr];

    // ── Initialize to zero (simulation only) ────────────────────
    // synthesis translate_off
    integer i;
    initial begin
        for (i = 0; i < `DATA_DEPTH; i = i + 1)
            mem[i] = {`XLEN{1'b0}};
    end
    // synthesis translate_on

endmodule
