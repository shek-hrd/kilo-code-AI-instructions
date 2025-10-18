#!/usr/bin/env node

/**
 * Kilo Code AI Instructions Package - Lite Installation Script
 * Simplified installer with core functionality for kilo code integration
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class KiloCodeLiteInstaller {
    constructor() {
        this.isWindows = os.platform() === 'win32';
        this.homeDir = os.homedir();
        this.appDataDir = this.isWindows ? process.env.APPDATA : path.join(this.homeDir, '.config');
        this.globalDir = path.join(this.appDataDir, 'KiloCode');
        this.workspaceDir = process.cwd();
        this.packageDir = __dirname;

        // Options - Default to workspace installation only
        this.options = {
            global: false,
            workspace: true,
            generateProfile: true  // Always generate profile for independence
        };
    }

    log(message) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${message}`);
    }

    async ensureDirectory(dir) {
        try {
            await fs.promises.mkdir(dir, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') {
                throw error;
            }
        }
    }

    async backupFile(source, backupName) {
        if (!fs.existsSync(source)) {
            return false;
        }

        const backupDir = path.join(this.globalDir, 'backup');
        await this.ensureDirectory(backupDir);
        const backupPath = path.join(backupDir, backupName);

        try {
            await fs.promises.copyFile(source, backupPath);
            this.log(`Backed up: ${backupPath}`);
            return true;
        } catch (error) {
            this.log(`Backup failed: ${error.message}`);
            return false;
        }
    }

    async copyFile(source, target) {
        try {
            await this.ensureDirectory(path.dirname(target));
            await fs.promises.copyFile(source, target);
            this.log(`Copied: ${target}`);
            return true;
        } catch (error) {
            this.log(`Copy failed: ${error.message}`);
            return false;
        }
    }

    async createVSCodeSettings(targetPath, isGlobal = false) {
        let content;

        if (isGlobal) {
            const instructionsPath = path.join(this.globalDir, 'ai-instructions.md').replace(/\\/g, '/');
            content = {
                "kiloCodeInstructions.instructionFile": instructionsPath,
                "kiloCodeInstructions.autoLoad": true,
                "kiloCodeInstructions.globalInstallation": true
            };
        } else {
            content = {
                "kiloCodeInstructions.workspaceEnabled": true,
                "kiloCodeInstructions.globalInstallationDetected": this.options.global
            };
        }

        try {
            await this.ensureDirectory(path.dirname(targetPath));
            await fs.promises.writeFile(targetPath, JSON.stringify(content, null, 4));
            this.log(`Created VS Code settings: ${targetPath}`);
            return true;
        } catch (error) {
            this.log(`Failed to create VS Code settings: ${error.message}`);
            return false;
        }
    }

    async generateProfileFromCurrent() {
        this.log('Generating new profile from current VS Code settings...');

        const profileDir = path.join(this.globalDir, 'profiles');
        await this.ensureDirectory(profileDir);

        try {
            // Read current VS Code settings
            const vscodeSettingsPath = path.join(this.appDataDir, 'Code', 'User', 'settings.json');
            let currentSettings = {};

            if (fs.existsSync(vscodeSettingsPath)) {
                try {
                    const settingsContent = await fs.promises.readFile(vscodeSettingsPath, 'utf8');
                    if (settingsContent.trim()) {
                        currentSettings = JSON.parse(settingsContent);
                    }
                } catch (error) {
                    this.log(`Could not read current VS Code settings: ${error.message}`);
                }
            }

            // Create independent profile
            const profileContent = {
                name: `Lite_Profile_${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}`,
                created: new Date().toISOString(),
                source: 'kilo-code-lite-installer',
                description: 'Independent profile generated from current VS Code configuration',
                settings: {
                    workspace: this.workspaceDir,
                    global: this.options.global,
                    timestamp: new Date().toISOString(),
                    vscodeSettingsSnapshot: currentSettings,
                    kiloCodeSettings: {
                        instructionFile: currentSettings['kiloCodeInstructions.instructionFile'] || null,
                        autoLoad: currentSettings['kiloCodeInstructions.autoLoad'] || false,
                        globalInstallation: currentSettings['kiloCodeInstructions.globalInstallation'] || false
                    }
                }
            };

            const profilePath = path.join(profileDir, `${profileContent.name}.json`);
            await fs.promises.writeFile(profilePath, JSON.stringify(profileContent, null, 4));

            this.log(`Generated independent profile: ${profilePath}`);
            return profilePath;
        } catch (error) {
            this.log(`Failed to generate profile: ${error.message}`);
            throw error;
        }
    }

    async checkPrerequisites() {
        this.log('🔍 Checking installation prerequisites...');

        // Check Node.js version
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
        if (majorVersion < 14) {
            throw new Error(`Node.js 14.0.0 or later required. Current version: ${nodeVersion}`);
        }
        this.log(`✅ Node.js version: ${nodeVersion}`);

        // Check if VSCode is running
        if (this.isWindows) {
            try {
                const { execSync } = require('child_process');
                // Check for Code.exe process
                const tasklist = execSync('tasklist /FI "IMAGENAME eq Code.exe" 2>nul', { encoding: 'utf8' });
                if (tasklist.includes('Code.exe')) {
                    this.log('⚠️  WARNING: VSCode (Code.exe) is currently running.');
                    this.log('   For best results, please close VSCode before installation.');
                    this.log('   Do you want to continue anyway? (y/N)');
                    // In automated scripts, we'll continue but warn the user
                }
            } catch (error) {
                // tasklist command might not be available, continue silently
            }
        }

        // Check file permissions in target directories
        const testPaths = [
            this.globalDir,
            path.join(this.workspaceDir, '.vscode'),
            path.join(this.appDataDir, 'Code', 'User')
        ];

        for (const testPath of testPaths) {
            try {
                await fs.promises.access(testPath, fs.constants.W_OK);
                this.log(`✅ Write permissions: ${testPath}`);
            } catch (error) {
                if (error.code === 'ENOENT') {
                    // Directory doesn't exist, try to create it to test permissions
                    try {
                        await this.ensureDirectory(testPath);
                        this.log(`✅ Directory created and writable: ${testPath}`);
                    } catch (dirError) {
                        throw new Error(`Cannot create or write to directory: ${testPath}. ${dirError.message}`);
                    }
                } else {
                    throw new Error(`No write permissions for directory: ${testPath}. ${error.message}`);
                }
            }
        }

        this.log('✅ All prerequisites checks passed');
    }

    async install() {
        this.log('🚀 Kilo Code AI Instructions Package - Liteauto Installation');
        this.log('========================================================');

        try {
            // Run prerequisite checks
            await this.checkPrerequisites();
            // Create directories
            await this.ensureDirectory(this.globalDir);
            await this.ensureDirectory(path.join(this.workspaceDir, '.vscode'));

            // Backup existing settings
            this.log('Creating backups...');
            const vscodeSettingsPath = path.join(this.appDataDir, 'Code', 'User', 'settings.json');
            await this.backupFile(vscodeSettingsPath, 'vscode-settings-backup-lite.json');

            // Copy instruction files
            this.log('Installing instruction files...');

            if (this.options.global) {
                // Global installation
                const globalInstructions = path.join(this.globalDir, 'ai-instructions.md');
                const sourceInstructions = path.join(this.packageDir, 'ai-instructions.md');

                await this.copyFile(sourceInstructions, globalInstructions);

                // Create global VS Code settings
                await this.createVSCodeSettings(vscodeSettingsPath, true);

                this.log(`✅ Global installation complete`);
            }

            if (this.options.workspace) {
                // Workspace installation
                const workspaceInstructions = path.join(this.workspaceDir, 'ai-instructions.md');
                const sourceInstructions = path.join(this.packageDir, 'ai-instructions.md');

                await this.copyFile(sourceInstructions, workspaceInstructions);

                // Create workspace VS Code settings
                const workspaceVSCodeSettings = path.join(this.workspaceDir, '.vscode', 'settings.json');
                await this.createVSCodeSettings(workspaceVSCodeSettings, false);

                this.log(`✅ Workspace installation complete`);
            }

            // Generate independent profile
            await this.generateProfileFromCurrent();

            this.log('');
            this.log('✅ Liteauto Installation Complete!');
            this.log('');
            this.log('🌐 INSTALLATION SUMMARY');
            this.log(`Global Installation: ${this.options.global ? 'YES' : 'NO (default: workspace only)'}`);
            this.log(`Workspace Installation: ${this.options.workspace ? 'YES (default)' : 'NO'}`);
            this.log(`Profile Generated: YES (Independent)`);
            this.log('');
            this.log('🔄 Restart VS Code to activate the configuration.');
            this.log('');
            this.log('To verify installation:');
            this.log('1. Start a new Kilo Code chat');
            this.log('2. Confirm instructions are loaded automatically');
            this.log('');
            this.log('📋 Installation options:');
            this.log('   node install.js --global-only  (Global installation only)');
            this.log('   node install.js --workspace-only  (Workspace installation only - default)');
            this.log('   node install.js  (Both global and workspace - original behavior)');
            this.log('');
            this.log('🗑️  To uninstall: Run "node uninstall.js" from this directory');

            return true;

        } catch (error) {
            this.log(`❌ Installation failed: ${error.message}`);
            return false;
        }
    }
}

// Main execution
async function main() {
    const installer = new KiloCodeLiteInstaller();

    // Parse command line arguments
    const args = process.argv.slice(2);
    args.forEach(arg => {
        switch (arg) {
            case '--workspace-only':
                installer.options.global = false;
                break;
            case '--global-only':
                installer.options.workspace = false;
                break;
        }
    });

    const success = await installer.install();

    if (success) {
        process.exit(0);
    } else {
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('Unhandled error:', error);
        process.exit(1);
    });
}

module.exports = KiloCodeLiteInstaller;