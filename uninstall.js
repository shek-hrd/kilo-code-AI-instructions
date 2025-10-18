#!/usr/bin/env node

/**
 * Kilo Code AI Instructions Package - Lite Uninstallation Script
 * Simplified uninstaller that cleanly removes lite installation
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class KiloCodeLiteUninstaller {
    constructor() {
        this.isWindows = os.platform() === 'win32';
        this.homeDir = os.homedir();
        this.appDataDir = this.isWindows ? process.env.APPDATA : path.join(this.homeDir, '.config');
        this.globalDir = path.join(this.appDataDir, 'KiloCode');
        this.workspaceDir = process.cwd();

        // Options
        this.options = {
            global: true,
            workspace: true,
            restoreBackups: true,
            keepBackups: true
        };
    }

    log(message) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${message}`);
    }

    async fileExists(filePath) {
        try {
            await fs.promises.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    async removeFile(filePath) {
        if (await this.fileExists(filePath)) {
            try {
                await fs.promises.unlink(filePath);
                this.log(`Removed: ${filePath}`);
                return true;
            } catch (error) {
                this.log(`Failed to remove ${filePath}: ${error.message}`);
                return false;
            }
        }
        return false;
    }

    async restoreFile(backupName, target) {
        const backupDir = path.join(this.globalDir, 'backup');
        const backupPath = path.join(backupDir, backupName);

        if (!await this.fileExists(backupPath)) {
            this.log(`Backup not found: ${backupPath}`);
            return false;
        }

        try {
            await fs.promises.copyFile(backupPath, target);
            this.log(`Restored: ${backupPath} -> ${target}`);
            return true;
        } catch (error) {
            this.log(`Failed to restore ${backupPath}: ${error.message}`);
            return false;
        }
    }

    async cleanVSCodeSettings(filePath) {
        if (!await this.fileExists(filePath)) {
            return true;
        }

        try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            const settings = JSON.parse(content);

            // Remove Kilo Code specific settings
            const kiloCodeSettings = [
                'kiloCodeInstructions.instructionFile',
                'kiloCodeInstructions.autoLoad',
                'kiloCodeInstructions.globalInstallation',
                'kiloCodeInstructions.workspaceEnabled',
                'kiloCodeInstructions.globalInstallationDetected'
            ];

            let modified = false;
            kiloCodeSettings.forEach(setting => {
                if (settings.hasOwnProperty(setting)) {
                    delete settings[setting];
                    modified = true;
                }
            });

            if (modified) {
                const remainingKeys = Object.keys(settings);
                if (remainingKeys.length === 0) {
                    // Remove the file if it only contained Kilo Code settings
                    await this.removeFile(filePath);
                    this.log('Removed empty VS Code settings file');
                } else {
                    // Update with remaining settings
                    await fs.promises.writeFile(filePath, JSON.stringify(settings, null, 4));
                    this.log('Cleaned VS Code settings file');
                }
            }

            return true;
        } catch (error) {
            this.log(`Failed to clean VS Code settings: ${error.message}`);
            return false;
        }
    }

    async verifyInstallation() {
        this.log('🔍 Verifying current installation before uninstallation...');

        const issues = [];

        // Check if VSCode is running
        if (this.isWindows) {
            try {
                const { execSync } = require('child_process');
                const tasklist = execSync('tasklist /FI "IMAGENAME eq Code.exe" 2>nul', { encoding: 'utf8' });
                if (tasklist.includes('Code.exe')) {
                    this.log('⚠️  WARNING: VSCode (Code.exe) is currently running.');
                    this.log('   For complete uninstallation, please close VSCode.');
                    issues.push('VSCode is running - restart may be required after uninstallation');
                }
            } catch (error) {
                // Continue silently if check fails
            }
        }

        // Check for KiloCode extension
        try {
            const vscodeSettingsPath = path.join(this.appDataDir, 'Code', 'User', 'settings.json');
            if (await this.fileExists(vscodeSettingsPath)) {
                const content = await fs.promises.readFile(vscodeSettingsPath, 'utf8');
                const settings = JSON.parse(content);

                const kiloCodeSettings = [
                    'kiloCodeInstructions.instructionFile',
                    'kiloCodeInstructions.autoLoad',
                    'kiloCodeInstructions.globalInstallation'
                ];

                let foundKiloCodeSettings = false;
                kiloCodeSettings.forEach(setting => {
                    if (settings.hasOwnProperty(setting)) {
                        foundKiloCodeSettings = true;
                        this.log(`✅ Found KiloCode setting: ${setting}`);
                    }
                });

                if (!foundKiloCodeSettings) {
                    issues.push('No KiloCode settings found - may not be properly installed');
                }
            } else {
                issues.push('No VSCode settings file found');
            }
        } catch (error) {
            issues.push(`Cannot verify VSCode settings: ${error.message}`);
        }

        // Check installation files
        const globalInstructions = path.join(this.globalDir, 'ai-instructions.md');
        const workspaceInstructions = path.join(this.workspaceDir, 'ai-instructions.md');

        if (await this.fileExists(globalInstructions)) {
            this.log('✅ Found global installation files');
        }

        if (await this.fileExists(workspaceInstructions)) {
            this.log('✅ Found workspace installation files');
        }

        if (issues.length > 0) {
            this.log('');
            this.log('⚠️  POTENTIAL ISSUES DETECTED:');
            issues.forEach(issue => this.log(`   - ${issue}`));
            this.log('');
            this.log('💡 TROUBLESHOOTING TIPS:');
            this.log('   1. Close VSCode completely before uninstallation');
            this.log('   2. Verify KiloCode extension is installed and active');
            this.log('   3. Check that installation completed successfully');
            this.log('   4. Restart VSCode after uninstallation if issues persist');
        } else {
            this.log('✅ Installation verification passed');
        }

        return issues;
    }

    async uninstall() {
        this.log('🗑️  Kilo Code AI Instructions Package - Liteauto Uninstallation');
        this.log('==========================================================');

        const filesToRemove = [];
        const filesRestored = [];

        try {
            // Verify installation first
            await this.verifyInstallation();
            // Restore backups if requested
            if (this.options.restoreBackups) {
                this.log('Restoring backed up settings...');

                const vscodeSettingsPath = path.join(this.appDataDir, 'Code', 'User', 'settings.json');
                if (await this.restoreFile('vscode-settings-backup-lite.json', vscodeSettingsPath)) {
                    filesRestored.push('VS Code settings');
                }
            }

            // Remove global installation files
            if (this.options.global) {
                this.log('Removing global installation files...');

                const globalInstructions = path.join(this.globalDir, 'ai-instructions.md');
                if (await this.removeFile(globalInstructions)) {
                    filesToRemove.push(globalInstructions);
                }

                // Clean global VS Code settings
                const globalVSCodeSettings = path.join(this.appDataDir, 'Code', 'User', 'settings.json');
                await this.cleanVSCodeSettings(globalVSCodeSettings);
            }

            // Remove workspace installation files
            if (this.options.workspace) {
                this.log('Removing workspace installation files...');

                const workspaceInstructions = path.join(this.workspaceDir, 'ai-instructions.md');
                if (await this.removeFile(workspaceInstructions)) {
                    filesToRemove.push(workspaceInstructions);
                }

                // Clean workspace VS Code settings
                const workspaceVSCodeSettings = path.join(this.workspaceDir, '.vscode', 'settings.json');
                await this.cleanVSCodeSettings(workspaceVSCodeSettings);

                // Remove .vscode directory if empty
                const vscodeDir = path.join(this.workspaceDir, '.vscode');
                if (await this.fileExists(vscodeDir)) {
                    try {
                        const files = await fs.promises.readdir(vscodeDir);
                        if (files.length === 0) {
                            await fs.promises.rmdir(vscodeDir);
                            this.log('Removed empty .vscode directory');
                        }
                    } catch (error) {
                        this.log(`Could not check .vscode directory: ${error.message}`);
                    }
                }
            }

            this.log('');
            this.log('✅ Liteauto Uninstallation Complete!');
            this.log('');
            this.log('FILES REMOVED:');
            filesToRemove.forEach(file => this.log(`- ${file}`));
            this.log('');
            this.log('FILES RESTORED:');
            if (filesRestored.length > 0) {
                filesRestored.forEach(file => this.log(`- ${file}`));
            } else {
                this.log('- No files restored');
            }
            this.log('');
            this.log('🔄 Restart VS Code to complete the cleanup.');
            this.log('');
            this.log('💡 TROUBLESHOOTING:');
            this.log('If instructions still don\'t load after uninstallation:');
            this.log('1. Restart VSCode completely');
            this.log('2. Verify KiloCode extension is installed and active');
            this.log('3. Check that uninstallation completed successfully');
            this.log('4. Try installing again with: node install.js');
            this.log('');
            this.log('To reinstall: Run "node install.js" from the liteauto package directory');

            if (this.options.keepBackups && await this.fileExists(path.join(this.globalDir, 'backup'))) {
                this.log('');
                this.log(`📦 Backup files remain in: ${path.join(this.globalDir, 'backup')}`);
            }

            return true;

        } catch (error) {
            this.log(`❌ Uninstallation failed: ${error.message}`);
            return false;
        }
    }
}

// Main execution
async function main() {
    const uninstaller = new KiloCodeLiteUninstaller();

    // Parse command line arguments
    const args = process.argv.slice(2);
    args.forEach(arg => {
        switch (arg) {
            case '--workspace-only':
                uninstaller.options.global = false;
                break;
            case '--global-only':
                uninstaller.options.workspace = false;
                break;
            case '--no-restore':
                uninstaller.options.restoreBackups = false;
                break;
            case '--remove-backups':
                uninstaller.options.keepBackups = false;
                break;
        }
    });

    const success = await uninstaller.uninstall();

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

module.exports = KiloCodeLiteUninstaller;