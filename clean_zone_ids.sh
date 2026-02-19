#!/bin/bash
# Deletes all *:Zone.Identifier files created by Windows when downloading files
find Mad-Assembler-2.1.6/ -name "*:Zone.Identifier" -type f -delete
echo "Done."
