from hijaiyyah.core.rom import pack_nibbles, unpack_nibbles, pack_rom, unpack_rom
from hijaiyyah.core.master_table import MASTER_TABLE
def test_roundtrip_nibbles():
    v = [2,0,0,1,0,1,0,0,0,1,0,0,0,0,1,1,1,0]
    assert unpack_nibbles(pack_nibbles(v)) == v
def test_rom_size():
    vecs = [list(e.vector) for e in MASTER_TABLE.all_entries()]
    assert len(pack_rom(vecs)) == 252
