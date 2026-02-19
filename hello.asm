section .data
    msg db 'Hello, World!', 0Ah     ; Message to
display. 0Ah is a linefeed character.

section .text
    global _start

_start:
    ; Write message to stdout using write syscall
(sys_write)
    mov eax, 4                    ; The syscall
number for sys_write (Linux/x86)
    mov ebx, 1                    ; File
descriptor: stdout (1)
    mov ecx, msg                  ; Pointer to the
string
    mov edx, 13                   ; Length of the
string (12 characters + 0Ah newline)
    int 0x80                      ; Call kernel

    ; Exit using exit syscall (sys_exit)
    mov eax, 1                    ; The syscall
number for sys_exit (Linux/x86)
    xor ebx, ebx                  ; Status code: 0
    int 0x80                      ; Call kernel
