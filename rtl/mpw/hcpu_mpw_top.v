// ============================================================================
// HCPU MPW Top-Level Wrapper — hcpu_mpw_top.v  (v2.0)
// Caravel user_project_wrapper compatible for Efabless Open MPW (SKY130)
// (c) 2026 HMCL — Hybit Technology
// ============================================================================
//
// This module is the top-level for the Caravel User Project Area.
// It instantiates:
//   1. hcpu_wb_adapter — Wishbone slave for SoC ↔ HCPU control
//   2. hcpu_top        — the HCPU processor core
//   3. Instruction memory (256 × 32-bit, writable via Wishbone)
//
// Programming flow (from management SoC firmware):
//   1. Write CTRL.reset_core = 1           (hold HCPU in reset)
//   2. For each instruction:
//        Write PROG_ADDR = address
//        Write PROG_DATA = instruction_word
//   3. Write CTRL.reset_core = 0, run = 1  (release reset, start)
//   4. Poll STATUS.halted until = 1
//   5. Read GPR_SEL / GPR_DATA for results
//

`include "hcpu_pkg.vh"

module hcpu_mpw_top (
`ifdef USE_POWER_PINS
    inout vccd1,    // User area 1 1.8V supply
    inout vssd1,    // User area 1 digital ground
`endif

    // ── Wishbone Slave Interface (from Caravel management SoC) ──
    input  wire        wb_clk_i,
    input  wire        wb_rst_i,
    input  wire        wbs_stb_i,
    input  wire        wbs_cyc_i,
    input  wire        wbs_we_i,
    input  wire [3:0]  wbs_sel_i,
    input  wire [31:0] wbs_dat_i,
    input  wire [31:0] wbs_adr_i,
    output wire        wbs_ack_o,
    output wire [31:0] wbs_dat_o,

    // ── Logic Analyzer (from Caravel) ───────────────────────────
    input  wire [127:0] la_data_in,
    output wire [127:0] la_data_out,
    input  wire [127:0] la_oenb,

    // ── GPIO I/O Pads (directly from Caravel) ───────────────────
    input  wire [37:0] io_in,
    output wire [37:0] io_out,
    output wire [37:0] io_oeb,        // Output enable (active low)

    // ── IRQ (active high) ───────────────────────────────────────
    output wire [2:0]  irq
);

    // ── System signals ──────────────────────────────────────────
    wire sys_clk = wb_clk_i;

    // ── Wishbone adapter ↔ HCPU wiring ──────────────────────────
    wire        core_rst_n;
    wire        core_halted;
    wire        core_guard_led;
    wire        core_uart_tx;
    wire        imem_we;
    wire [7:0]  imem_waddr;
    wire [31:0] imem_wdata;
    wire [4:0]  gpr_raddr_wb;
    wire [31:0] gpr_rdata_wb;
    wire [7:0]  core_flags;

    // ── Instruction memory (256 × 32-bit) ───────────────────────
    reg [`ILEN-1:0] imem [0:255];
    wire [`CODE_ADDR_W-1:0] imem_addr;
    wire                    imem_ce;
    reg  [`ILEN-1:0]        imem_data_r;
    wire [`ILEN-1:0]        imem_data;
    
    assign imem_data = imem_data_r;

    // BRAM-style synchronous read with stall enable
    always @(posedge sys_clk) begin
        if (imem_ce)
            imem_data_r <= imem[imem_addr[7:0]];
    end

    // IMEM write port (from Wishbone adapter)
    always @(posedge sys_clk) begin
        if (imem_we)
            imem[imem_waddr] <= imem_wdata;
    end

    // ── Initialize IMEM to NOP (simulation only) ────────────────
    // synthesis translate_off
    integer i;
    initial begin
        for (i = 0; i < 256; i = i + 1)
            imem[i] = {`OP_NOP, 24'h000000};
    end
    // synthesis translate_on

    // ── Wishbone Bus Adapter ────────────────────────────────────
    hcpu_wb_adapter u_wb_adapter (
        .wb_clk_i       (wb_clk_i),
        .wb_rst_i        (wb_rst_i),
        .wbs_stb_i       (wbs_stb_i),
        .wbs_cyc_i       (wbs_cyc_i),
        .wbs_we_i        (wbs_we_i),
        .wbs_sel_i       (wbs_sel_i),
        .wbs_dat_i       (wbs_dat_i),
        .wbs_adr_i       (wbs_adr_i),
        .wbs_ack_o       (wbs_ack_o),
        .wbs_dat_o       (wbs_dat_o),

        .core_rst_n      (core_rst_n),
        .core_halted     (core_halted),
        .core_guard_led  (core_guard_led),

        .imem_we         (imem_we),
        .imem_waddr      (imem_waddr),
        .imem_wdata      (imem_wdata),

        .gpr_raddr       (gpr_raddr_wb),
        .gpr_rdata       (gpr_rdata_wb),

        .core_flags      (core_flags)
    );

    // ── HCPU Core ───────────────────────────────────────────────
    hcpu_top #(
        .CLK_HZ(40_000_000),  // Caravel wb_clk_i typical frequency
        .BAUD  (115200),
        .USE_DSP(0)           // ASIC: use shift-add multiplier
    ) u_hcpu (
        .clk            (sys_clk),
        .rst_n          (core_rst_n),
        .imem_addr      (imem_addr),
        .imem_ce        (imem_ce),
        .imem_data      (imem_data),
        .uart_tx        (core_uart_tx),
        .halted         (core_halted),
        .guard_led      (core_guard_led),
        // Debug / Wishbone GPR read-back (synthesis-safe)
        .dbg_gpr_raddr  (gpr_raddr_wb),
        .dbg_gpr_rdata  (gpr_rdata_wb),
        .dbg_flags      (core_flags)
    );

    // ── GPIO Output Mapping ─────────────────────────────────────
    //   io_out[8]  = UART TX
    //   io_out[9]  = Halted indicator
    //   io_out[10] = Guard LED
    assign io_out[7:0]   = 8'd0;          // Unused
    assign io_out[8]     = core_uart_tx;   // UART TX → GPIO[8]
    assign io_out[9]     = core_halted;    // Halted  → GPIO[9]
    assign io_out[10]    = core_guard_led; // Guard   → GPIO[10]
    assign io_out[37:11] = 27'd0;          // Unused

    // ── GPIO Output Enable (active low: 0 = output) ─────────────
    assign io_oeb[7:0]   = 8'hFF;         // Input mode
    assign io_oeb[8]     = 1'b0;          // Output: UART TX
    assign io_oeb[9]     = 1'b0;          // Output: Halted
    assign io_oeb[10]    = 1'b0;          // Output: Guard LED
    assign io_oeb[37:11] = {27{1'b1}};    // Input mode

    // ── Logic Analyzer ──────────────────────────────────────────
    // Expose internal signals for silicon debug
    assign la_data_out[0]     = core_halted;
    assign la_data_out[1]     = core_guard_led;
    assign la_data_out[2]     = core_uart_tx;
    assign la_data_out[3]     = core_rst_n;
    assign la_data_out[35:4]  = {imem_addr, 20'd0};     // Current PC
    assign la_data_out[43:36] = core_flags;               // Current flags
    assign la_data_out[127:44] = 84'd0;

    // ── IRQ ─────────────────────────────────────────────────────
    // IRQ[0]: HCPU halted (can wake management SoC from WFI)
    assign irq[0] = core_halted;
    assign irq[1] = 1'b0;
    assign irq[2] = 1'b0;

endmodule
