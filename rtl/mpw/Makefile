# ============================================================================
# HCPU MPW — OpenLane Makefile
# Hybit Technology — Efabless Open MPW (SKY130)
# ============================================================================

OPENLANE_ROOT ?= $(HOME)/OpenLane
PDK_ROOT ?= $(HOME)/pdk
PDK ?= sky130A

DESIGN_NAME = hcpu_mpw_top
DESIGN_DIR = $(shell pwd)

.PHONY: harden clean interactive lint

# ── Full automated synthesis flow ────────────────────────────
harden:
	@echo "=== HCPU MPW — Starting OpenLane Hardening ==="
	cd $(OPENLANE_ROOT) && \
	python3 flow.py \
		--design_dir $(DESIGN_DIR) \
		--tag hcpu_run \
		--config_file $(DESIGN_DIR)/config.json \
		--pdk $(PDK) \
		--pdk_root $(PDK_ROOT)
	@echo "=== Hardening complete. Check runs/hcpu_run/ for results ==="

# ── Interactive mode for debugging ───────────────────────────
interactive:
	cd $(OPENLANE_ROOT) && \
	python3 flow.py \
		--design_dir $(DESIGN_DIR) \
		--interactive \
		--pdk $(PDK) \
		--pdk_root $(PDK_ROOT)

# ── Verilator lint check (pre-synthesis sanity) ──────────────
lint:
	@echo "=== Running Verilator lint ==="
	verilator --lint-only \
		-I../../ \
		hcpu_mpw_top.v \
		hcpu_wb_adapter.v \
		../../hcpu_top.v \
		../../hcpu_fetch.v \
		../../hcpu_decode.v \
		../../hcpu_execute.v \
		../../hcpu_memory.v \
		../../hcpu_writeback.v \
		../../hcpu_regfile.v \
		../../hcpu_forward.v \
		../../hcpu_controller.v \
		../../hcpu_rom.v \
		../../hcpu_guard.v \
		../../hcpu_codex_alu.v \
		../../hcpu_dataram.v \
		../../hcpu_uart_tx.v \
		--top-module hcpu_mpw_top \
		-Wall
	@echo "=== Lint complete ==="

# ── Clean generated files ────────────────────────────────────
clean:
	rm -rf runs/
	@echo "Cleaned OpenLane runs."
