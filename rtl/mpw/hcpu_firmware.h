// ============================================================================
// HCPU MPW Firmware — hcpu_firmware.h
// C header for Caravel management SoC to control HCPU via Wishbone
// (c) 2026 HMCL — Hybit Technology
// ============================================================================
//
// Usage (from Caravel management SoC firmware):
//
//   #include "hcpu_firmware.h"
//
//   void main() {
//       hcpu_reset();
//       hcpu_load_instruction(0, 0x40000002);  // HLOAD H0, 2 (Ba)
//       hcpu_load_instruction(1, 0x60000000);  // HGRD H0
//       hcpu_load_instruction(2, 0x01000000);  // HALT
//       hcpu_run();
//       hcpu_wait_halt();
//       uint32_t flags = hcpu_read_flags();
//       // flags & 0x01 == guard result
//   }
//

#ifndef HCPU_FIRMWARE_H
#define HCPU_FIRMWARE_H

#include <stdint.h>

// ── HCPU Wishbone Register Base Address ─────────────────────
// The user project area in Caravel is mapped at 0x30000000
#define HCPU_BASE_ADDR  0x30000000

#define HCPU_REG_CTRL       (*(volatile uint32_t*)(HCPU_BASE_ADDR + 0x00))
#define HCPU_REG_STATUS     (*(volatile uint32_t*)(HCPU_BASE_ADDR + 0x04))
#define HCPU_REG_PROG_ADDR  (*(volatile uint32_t*)(HCPU_BASE_ADDR + 0x08))
#define HCPU_REG_PROG_DATA  (*(volatile uint32_t*)(HCPU_BASE_ADDR + 0x0C))
#define HCPU_REG_GPR_SEL    (*(volatile uint32_t*)(HCPU_BASE_ADDR + 0x10))
#define HCPU_REG_GPR_DATA   (*(volatile uint32_t*)(HCPU_BASE_ADDR + 0x14))
#define HCPU_REG_CYCLE_CNT  (*(volatile uint32_t*)(HCPU_BASE_ADDR + 0x18))
#define HCPU_REG_FLAGS      (*(volatile uint32_t*)(HCPU_BASE_ADDR + 0x1C))

// ── Control bits ────────────────────────────────────────────
#define CTRL_RUN         (1 << 0)
#define CTRL_RESET_CORE  (1 << 1)

// ── Status bits ─────────────────────────────────────────────
#define STATUS_HALTED    (1 << 0)
#define STATUS_GUARD_LED (1 << 1)
#define STATUS_RUNNING   (1 << 2)

// ── Flag bits ───────────────────────────────────────────────
#define FLAG_G   (1 << 0)
#define FLAG_Z   (1 << 1)
#define FLAG_O   (1 << 2)
#define FLAG_LT  (1 << 3)

// ── API Functions ───────────────────────────────────────────

// Hold HCPU in reset, clear run bit
static inline void hcpu_reset(void) {
    HCPU_REG_CTRL = CTRL_RESET_CORE;  // Assert reset, deassert run
}

// Load one 32-bit instruction into HCPU instruction memory
static inline void hcpu_load_instruction(uint8_t addr, uint32_t instruction) {
    HCPU_REG_PROG_ADDR = addr;
    HCPU_REG_PROG_DATA = instruction;
}

// Release reset and start execution
static inline void hcpu_run(void) {
    HCPU_REG_CTRL = CTRL_RUN;  // Deassert reset, assert run
}

// Block until HCPU halts
static inline void hcpu_wait_halt(void) {
    while (!(HCPU_REG_STATUS & STATUS_HALTED))
        ;
}

// Read a GPR value (0–17)
static inline uint32_t hcpu_read_gpr(uint8_t index) {
    HCPU_REG_GPR_SEL = index;
    return HCPU_REG_GPR_DATA;
}

// Read the current flags register
static inline uint32_t hcpu_read_flags(void) {
    return HCPU_REG_FLAGS;
}

// Read the cycle counter
static inline uint32_t hcpu_read_cycles(void) {
    return HCPU_REG_CYCLE_CNT;
}

// Check if guard passed (after HGRD instruction)
static inline int hcpu_guard_passed(void) {
    return (HCPU_REG_FLAGS & FLAG_G) != 0;
}

// ── Higher-Level Convenience ────────────────────────────────

// Load a program from an array, reset, run, wait for halt
static inline uint32_t hcpu_execute_program(
    const uint32_t* program,
    uint8_t         length,
    uint8_t         result_gpr
) {
    hcpu_reset();

    for (uint8_t i = 0; i < length; i++) {
        hcpu_load_instruction(i, program[i]);
    }

    hcpu_run();
    hcpu_wait_halt();

    return hcpu_read_gpr(result_gpr);
}

#endif // HCPU_FIRMWARE_H
