# ==============================================================================
# Makefile for Xilinx FPGA Synthesis (Arty A7)
# ==============================================================================

# Default program to build and burn
PROGRAM ?= ../../programs/test_bsm.hasm
PYTHON  ?= python
VIVADO  ?= vivado

all: bitstream

# Step 1: Compile Assembly to HEX
program.hex: $(PROGRAM)
	$(PYTHON) ../../scripts/asm2hex.py $< > program.hex

# Step 2: Run Vivado Batch Synthesis
bitstream: program.hex
	$(VIVADO) -mode batch -source build.tcl

# Step 3: Flash Bitstream (Requires Hardware Manager setup/TCL)
flash:
	@echo "To flash, open Vivado GUI or run openfpgaloader:"
	@echo "openFPGALoader -b arty_a7_35t build/hcpu_top.bit"

clean:
	rm -rf .Xil/ build/ vivado.jou vivado.log program.hex

.PHONY: all bitstream flash clean
