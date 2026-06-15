#!/bin/bash
# AgentVault Quick Start

echo "🚀 AgentVault Quick Start"
echo "========================"

# Check prerequisites
echo "✓ Checking prerequisites..."
command -v node &> /dev/null || { echo "❌ Node.js required"; exit 1; }
command -v python3 &> /dev/null || { echo "❌ Python 3 required"; exit 1; }

# Backend setup
echo ""
echo "📦 Setting up backend..."
cd backend
python3 -m venv venv
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate
pip install -q -r requirements.txt
echo "✅ Backend ready"

# Create backend .env
if [ ! -f .env ]; then
  cat > .env << EOF
MANTLE_RPC=https://rpc.testnet.mantle.xyz
VAULT_ADDRESS=0x...  # Set after contract deployment
STRATEGY_MANAGER_ADDRESS=0x...  # Set after contract deployment
EOF
  echo "📝 Created .env - update with contract addresses"
fi

cd ..

# Frontend setup
echo ""
echo "🎨 Setting up frontend..."
cd frontend
npm install -q
echo "✅ Frontend ready"

# Create frontend .env
if [ ! -f .env.local ]; then
  cat > .env.local << EOF
NEXT_PUBLIC_VAULT_ADDRESS=0x...
NEXT_PUBLIC_STRATEGY_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
  echo "📝 Created .env.local - update with contract addresses"
fi

cd ..

# Contracts setup
echo ""
echo "🔧 Setting up contracts..."
cd contracts
npm install -q
echo "✅ Contracts ready"

# Create contracts .env
if [ ! -f .env ]; then
  cat > .env << EOF
PRIVATE_KEY=your_private_key_here
MANTLE_TESTNET_RPC=https://rpc.testnet.mantle.xyz
EOF
  echo "📝 Created .env - update with your private key"
fi

cd ..

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env files with contract addresses and keys"
echo "2. Deploy contracts: cd contracts && npm run deploy"
echo "3. Start backend: cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo "4. Start frontend: cd frontend && npm run dev"
echo ""
echo "Frontend will be at http://localhost:3000"
echo "Backend API at http://localhost:8000/docs"
