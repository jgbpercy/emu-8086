bits 16

; Register/memory with register to either
add bx, cx
add [bx + 123], dx
add [bx - 20], dx
add [4999], si
add di, [bp + di + 7891]
add di, [bp + di - 8451]

; Immediate to register/memory
; TODO

; Immediate to accumulator
add ax, 6846
add al, 3