// ============================================================================
// HCPU Wishbone Bus Adapter — hcpu_wb_adapter.v
// Wishbone B4 Slave interface for Caravel SoC ↔ HCPU integration
// (c) 2026 HMCL — Hybit Technology
// ============================================================================
//
// Memory Map (relative to user project base address):
//   0x00  [W]  CTRL     — bit[0]: run, bit[1]: reset_core
//   0x04  [R]  STATUS   — bit[0]: halted, bit[1]: guard_led, bit[2]: running
//   0x08  [W]  PROG_ADDR — instruction address for program loading (8-bit)
//   0x0C  [W]  PROG_DATA — instruction word (32-bit), auto-writes to IMEM
//   0x10  [R]  GPR_SEL  — select which GPR to read (write index here)
//   0x14  [R]  GPR_DATA — read-back GPR[GPR_SEL] value
//   0x18  [R]  CYCLE_CNT— cycle counter (free-running, 32-bit)
//   0x1C  [R]  FLAGS    — current flag register value
//
// Protocol: Standard Wishbone B4 pipelined slave.
//   - Single-cycle ACK for all register accesses.
//   - IMEM writes are forwarded to the instruction memory array.
//   - The management SoC can load a program, start execution, then
//     poll STATUS until halted=1.
//

`include "hcpu_pkg.vh"

module hcpu_wb_adapter (
    // ── Wishbone Slave Interface ────────────────────────────────
    input  wire        wb_clk_i,
    input  wire        wb_rst_i,
    input  wire        wbs_stb_i,
    input  wire        wbs_cyc_i,
    input  wire        wbs_we_i,
    input  wire [3:0]  wbs_sel_i,
    input  wire [31:0] wbs_dat_i,
    input  wire [31:0] wbs_adr_i,
    output reg         wbs_ack_o,
    output reg  [31:0] wbs_dat_o,

    // ── HCPU Core Interface ────────────────────────────────────
    output reg         core_rst_n,     // Active-low reset to HCPU core
    input  wire        core_halted,    // HCPU halted status
    input  wire        core_guard_led, // HCPU guard flag

    // ── Instruction Memory Write Port ───────────────────────────
    output reg         imem_we,        // Write enable to IMEM
    output reg  [7:0]  imem_waddr,     // Write address (256 entries)
    output reg  [31:0] imem_wdata,     // Write data (32-bit instruction)

    // ── GPR Read-Back Port ──────────────────────────────────────
    output reg  [4:0]  gpr_raddr,      // GPR address to read
    input  wire [31:0] gpr_rdata,      // GPR read data

    // ── FLAGS Read-Back ─────────────────────────────────────────
    input  wire [7:0]  core_flags
);

    // ── Address decode ──────────────────────────────────────────
    // Use lower 5 bits of address for register select
    wire [4:0] reg_addr = wbs_adr_i[6:2];  // Word-aligned

    localparam REG_CTRL      = 5'h00;  // 0x00
    localparam REG_STATUS    = 5'h01;  // 0x04
    localparam REG_PROG_ADDR = 5'h02;  // 0x08
    localparam REG_PROG_DATA = 5'h03;  // 0x0C
    localparam REG_GPR_SEL   = 5'h04;  // 0x10
    localparam REG_GPR_DATA  = 5'h05;  // 0x14
    localparam REG_CYCLE_CNT = 5'h06;  // 0x18
    localparam REG_FLAGS     = 5'h07;  // 0x1C

    // ── Internal state ──────────────────────────────────────────
    reg        ctrl_run;
    reg [7:0]  prog_addr_reg;
    reg [31:0] cycle_counter;

    // Valid Wishbone transaction
    wire wb_valid = wbs_stb_i && wbs_cyc_i;

    // ── Cycle counter ───────────────────────────────────────────
    always @(posedge wb_clk_i) begin
        if (wb_rst_i)
            cycle_counter <= 32'd0;
        else if (ctrl_run && !core_halted)
            cycle_counter <= cycle_counter + 1;
    end

    // ── Wishbone transaction handler ────────────────────────────
    always @(posedge wb_clk_i) begin
        if (wb_rst_i) begin
            wbs_ack_o     <= 1'b0;
            wbs_dat_o     <= 32'd0;
            core_rst_n    <= 1'b0;
            ctrl_run      <= 1'b0;
            imem_we       <= 1'b0;
            imem_waddr    <= 8'd0;
            imem_wdata    <= 32'd0;
            prog_addr_reg <= 8'd0;
            gpr_raddr     <= 5'd0;
        end else begin
            // Default: deassert one-shot signals
            wbs_ack_o <= 1'b0;
            imem_we   <= 1'b0;

            if (wb_valid && !wbs_ack_o) begin
                wbs_ack_o <= 1'b1;  // Single-cycle ACK

                if (wbs_we_i) begin
                    // ── WRITE ────────────────────────────────
                    case (reg_addr)
                        REG_CTRL: begin
                            ctrl_run   <= wbs_dat_i[0];
                            core_rst_n <= ~wbs_dat_i[1];  // bit[1]=1 → reset active
                        end
                        REG_PROG_ADDR: begin
                            prog_addr_reg <= wbs_dat_i[7:0];
                        end
                        REG_PROG_DATA: begin
                            imem_we    <= 1'b1;
                            imem_waddr <= prog_addr_reg;
                            imem_wdata <= wbs_dat_i;
                        end
                        REG_GPR_SEL: begin
                            gpr_raddr <= wbs_dat_i[4:0];
                        end
                        default: ;  // Ignore writes to read-only regs
                    endcase
                end else begin
                    // ── READ ─────────────────────────────────
                    case (reg_addr)
                        REG_CTRL:      wbs_dat_o <= {30'd0, ctrl_run, ~core_rst_n};
                        REG_STATUS:    wbs_dat_o <= {29'd0, ctrl_run, core_guard_led, core_halted};
                        REG_PROG_ADDR: wbs_dat_o <= {24'd0, prog_addr_reg};
                        REG_PROG_DATA: wbs_dat_o <= 32'd0;  // Write-only
                        REG_GPR_SEL:   wbs_dat_o <= {27'd0, gpr_raddr};
                        REG_GPR_DATA:  wbs_dat_o <= gpr_rdata;
                        REG_CYCLE_CNT: wbs_dat_o <= cycle_counter;
                        REG_FLAGS:     wbs_dat_o <= {24'd0, core_flags};
                        default:       wbs_dat_o <= 32'hDEAD_BEEF;
                    endcase
                end
            end
        end
    end

endmodule
