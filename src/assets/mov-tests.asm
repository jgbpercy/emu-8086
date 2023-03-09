bits 16

; Register/memory to/from register
mov cx, bx
mov ah, cl
mov [bp + si + 345], dh
mov [bp + si - 125], dh
mov bx, [bp + di + 6666]
mov bx, [bp + di - 5555]

; Immediate to register/memory
mov dx, word 4681
mov [si], byte 4
mov [456], word 7890

; Immeidate to register
mov dl, 5
mov cx, 9919

; Memory to accumulator
mov al, [4593]
mov ax, [78]

; Accumulator to memory
mov [9988], ax
mov [98], al

; Register/memory to segment register
; TODO

; Segment register to register/memory
; TODO