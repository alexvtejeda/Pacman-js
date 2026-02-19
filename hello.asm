section .data
    msg     db "Hello, World!", 0xA   ; string + newline
    len     equ $ - msg               ; length of string

section .text
    global _start                     ; make label visible to linker

_start:                              
    mov eax, 4       ; syscall: sys_write
    mov ebx, 1       ; file descriptor: stdout
    mov ecx, msg     ; pointer to string
    mov edx, len     ; length of string
    int 0x80         ; make syscall

    mov eax, 1       ; syscall: sys_exit
    xor ebx, ebx     ; exit code 0
    int 0x80         ; make syscall
