# 🚀 Kilo Code Instructions - Lite Extension

**🚀 Lightweight VSCode extension package for Kilo Code AI instruction management.**

## 📦 Extension Package

- **File**: `kilo-code-instructions-lite-1.0.0.vsix`
- **Size**: ~19 MB (includes all dependencies)
- **Type**: Installable VSCode extension

## ✨ Features

- **One-Click Installation**: Install directly in VSCode
- **Automatic Loading**: AI instructions load on startup
- **Command Integration**: Install/uninstall via command palette
- **Configuration Options**: Customizable settings
- **Clean Uninstallation**: Complete removal with settings cleanup

## 🛠️ Installation

### Option 1: VSCode Extension Manager
1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X)
3. Click "..." menu → "Install from VSIX..."
4. Select `kilo-code-instructions-lite-1.0.0.vsix`
5. Reload VSCode when prompted

### Option 2: Command Line
```bash
code --install-extension kilo-code-instructions-lite-1.0.0.vsix
```

## 🎯 Usage

### Automatic Operation
- Extension activates on VSCode startup
- AI instructions load automatically if enabled
- No manual intervention required

### Manual Commands
- **Install Instructions**: `Kilo Code: Install Kilo Code Instructions`
- **Uninstall Instructions**: `Kilo Code: Uninstall Kilo Code Instructions`
- **Show Instructions**: `Kilo Code: Show AI Instructions`

### Configuration
Access settings via VSCode Settings (Ctrl+,):
- `kiloCodeInstructions.autoLoad`: Enable/disable automatic loading
- `kiloCodeInstructions.instructionFile`: Custom instruction file path
- `kiloCodeInstructions.globalInstallation`: Global installation mode

## 🔧 What It Does

1. **Activation**: Registers commands and loads configuration
2. **Integration**: Sets up Kilo Code extension compatibility
3. **Instruction Management**: Handles AI instruction loading/unloading
4. **Settings Management**: Updates VSCode configuration as needed

## ✅ Requirements

- **VSCode**: 1.80.0 or higher
- **Kilo Code Extension**: Must be installed for full functionality

## 🚨 Troubleshooting

**Problem**: Instructions don't load
**Solution**:
1. Ensure Kilo Code extension is installed and active
2. Check that extension is enabled in VSCode
3. Verify configuration settings
4. Restart VSCode completely

**Problem**: Commands not available
**Solution**:
1. Reload VSCode window (Ctrl+Shift+P → "Developer: Reload Window")
2. Check extension is installed correctly
3. Verify Kilo Code extension compatibility

## 📋 Package Contents

```
kilo-code-instructions-lite-1.0.0.vsix
├── extension/
│   ├── out/extension.js          # Compiled extension code
│   ├── ai-instructions.md        # Core AI instructions
│   ├── package.json              # Extension manifest
│   └── [dependencies]            # Runtime dependencies
```

## 🔄 Updates

To update the extension:
1. Package new version: `npm run package`
2. Install updated .vsix file in VSCode
3. Reload VSCode

## 🗑️ Uninstallation

### Via VSCode
1. Go to Extensions (Ctrl+Shift+X)
2. Find "Kilo Code Instructions - Lite Edition"
3. Click gear icon → "Uninstall"
4. Reload VSCode

### Via Command Line
```bash
code --uninstall-extension kilo-code-instructions-lite
```

## 📄 License

MIT License - Free to use, modify, and distribute.

---

**Ready to enhance your AI development experience?**

**Install the extension and experience the power of optimized Kilo Code instructions!**

*Version 1.0.0 - VSCode Extension Edition*

*Made with ❤️ by* ***shekhrd***
for ***breakthroughIdeas*** with the help of ***KILO Code*** with ***Code Supernova 1 million****

*Donations are appreciated! If you like the idea, consider donating ETH to:*
***0x6f602be9fccf656c8c3e9f36d2064d580264b393***
[![](https://img.shields.io/badge/donate-ETH-yellow.svg)](https://www.buymeacoffee.com/shekhrd)
[![GitHub](https://img.shields.io/github/stars/kilo-code-AI-instructions/kilo-code-instructions.svg)](https://github.com/shek-hrd/kilo-code-AI-instructions)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)