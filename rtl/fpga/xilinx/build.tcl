# ==============================================================================
# Vivado Batch Synthesis Script for HCPU (Arty A7-35T)
# Target: XC7A35T-1CPG236C
# (c) 2026 HMCL
# ==============================================================================

set PROJECT_NAME "hcpu_fpga"
set PART_NAME "xc7a35tcpg236-1"
set BUILD_DIR "./build"

# Create build directory
file mkdir $BUILD_DIR

# Create project in memory
create_project -in_memory -part $PART_NAME

# Set general options
set_property board_part digilentinc.com:arty-a7-35:part0:1.1 [current_project]
set_property default_lib work [current_project]

# Read RTL files
set rtl_files [glob -nocomplain ../../*.v ../../*.vh]
foreach f $rtl_files {
    if {[string match "*.vh" $f]} {
        read_verilog -sv $f
    } else {
        read_verilog $f
    }
}
read_verilog "./hcpu_xilinx_top.v"

# Read constraints
read_xdc "./hcpu_xilinx.xdc"

# Set top module
set_property top hcpu_xilinx_top [current_fileset]

# Synthesize
synth_design -top hcpu_xilinx_top -part $PART_NAME -flatten_hierarchy rebuilt
write_checkpoint -force $BUILD_DIR/post_synth.dcp

# Opt Design
opt_design
# Place Design
place_design
# Route Design
route_design

# Write Outputs
write_checkpoint -force $BUILD_DIR/post_route.dcp
write_bitstream -force $BUILD_DIR/hcpu_top.bit

# Reports
report_timing_summary -file $BUILD_DIR/timing_summary.rpt
report_utilization -file $BUILD_DIR/utilization.rpt

puts "=========================================================="
puts "HCPU SYNTHESIS COMPLETE: Bitstream generated in build dir."
puts "=========================================================="
exit
