#!/bin/bash

echo ""
echo "===================================================="
echo "  Setting Up Demo Data for New Features"
echo "===================================================="
echo ""

echo "Step 1: Creating demo user and sample data..."
psql -U postgres -d whereismybus -f create_demo_user.sql

echo ""
echo "===================================================="
echo "  Setup Complete!"
echo "===================================================="
echo ""
echo "Demo User Created:"
echo "  User ID: 00000000-0000-0000-0000-000000000001"
echo "  Phone: 9999999999"
echo "  Name: Demo User"
echo ""
echo "You can now test Bus Buddy AI with this user!"
echo ""

