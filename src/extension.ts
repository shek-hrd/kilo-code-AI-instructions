import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface KiloCodeSettings {
    autoLoad: boolean;
    instructionFile: string;
    globalInstallation: boolean;
}

class KiloCodeExtension {
    private context: vscode.ExtensionContext;
    private settings: KiloCodeSettings = { autoLoad: true, instructionFile: '', globalInstallation: false };
    private instructionFilePath: string;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.instructionFilePath = path.join(context.extensionPath, 'ai-instructions.md');
        this.loadSettings();
    }

    private loadSettings(): void {
        const config = vscode.workspace.getConfiguration('kiloCodeInstructions');
        this.settings = {
            autoLoad: config.get('autoLoad', true),
            instructionFile: config.get('instructionFile', ''),
            globalInstallation: config.get('globalInstallation', false)
        };
    }

    public async activate(): Promise<void> {
        console.log('Kilo Code Instructions Lite extension is now active');

        // Register commands
        this.registerCommands();

        // Auto-load instructions if enabled
        if (this.settings.autoLoad) {
            await this.loadInstructions();
        }

        // Watch for configuration changes
        vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('kiloCodeInstructions')) {
                this.loadSettings();
                if (this.settings.autoLoad) {
                    this.loadInstructions();
                }
            }
        });
    }

    public async deactivate(): Promise<void> {
        console.log('Kilo Code Instructions Lite extension is now deactivated');
        await this.unloadInstructions();
    }

    private registerCommands(): void {
        const commands = [
            vscode.commands.registerCommand('kilo-code-instructions-lite.install', () => this.installInstructions()),
            vscode.commands.registerCommand('kilo-code-instructions-lite.uninstall', () => this.uninstallInstructions()),
            vscode.commands.registerCommand('kilo-code-instructions-lite.showInstructions', () => this.showInstructions())
        ];

        commands.forEach(disposable => this.context.subscriptions.push(disposable));
    }

    private async loadInstructions(): Promise<void> {
        try {
            if (!fs.existsSync(this.instructionFilePath)) {
                vscode.window.showErrorMessage('AI instructions file not found in extension directory');
                return;
            }

            const instructions = fs.readFileSync(this.instructionFilePath, 'utf8');

            // Set the instructions in VS Code settings
            const config = vscode.workspace.getConfiguration();
            const kiloCodeConfig = config.inspect('kiloCodeInstructions');

            if (kiloCodeConfig) {
                // Update workspace settings if available
                if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
                    const workspaceConfig = vscode.workspace.getConfiguration(undefined, vscode.workspace.workspaceFolders[0]);
                    await workspaceConfig.update('kiloCodeInstructions.instructionFile', this.instructionFilePath, vscode.ConfigurationTarget.Workspace);
                } else {
                    // Update global settings
                    await config.update('kiloCodeInstructions.instructionFile', this.instructionFilePath, vscode.ConfigurationTarget.Global);
                }

                await config.update('kiloCodeInstructions.autoLoad', true, vscode.ConfigurationTarget.Global);
                await config.update('kiloCodeInstructions.instructionFile', this.instructionFilePath, vscode.ConfigurationTarget.Global);

                vscode.window.showInformationMessage('Kilo Code AI instructions loaded successfully');
            } else {
                vscode.window.showWarningMessage('Kilo Code extension not found. Please install Kilo Code extension first.');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to load instructions: ${error}`);
        }
    }

    private async unloadInstructions(): Promise<void> {
        try {
            const config = vscode.workspace.getConfiguration();

            // Clear Kilo Code settings
            await config.update('kiloCodeInstructions.instructionFile', undefined, vscode.ConfigurationTarget.Global);
            await config.update('kiloCodeInstructions.autoLoad', undefined, vscode.ConfigurationTarget.Global);
            await config.update('kiloCodeInstructions.instructionFile', undefined, vscode.ConfigurationTarget.Global);

            if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
                const workspaceConfig = vscode.workspace.getConfiguration(undefined, vscode.workspace.workspaceFolders[0]);
                await workspaceConfig.update('kiloCodeInstructions.instructionFile', undefined, vscode.ConfigurationTarget.Workspace);
            }

            vscode.window.showInformationMessage('Kilo Code AI instructions unloaded');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to unload instructions: ${error}`);
        }
    }

    private async installInstructions(): Promise<void> {
        await this.loadInstructions();
    }

    private async uninstallInstructions(): Promise<void> {
        await this.unloadInstructions();
    }

    private async showInstructions(): Promise<void> {
        try {
            if (!fs.existsSync(this.instructionFilePath)) {
                vscode.window.showErrorMessage('AI instructions file not found');
                return;
            }

            const instructions = fs.readFileSync(this.instructionFilePath, 'utf8');
            const document = await vscode.workspace.openTextDocument({
                content: instructions,
                language: 'markdown'
            });

            await vscode.window.showTextDocument(document);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to show instructions: ${error}`);
        }
    }
}

let extension: KiloCodeExtension | undefined;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    extension = new KiloCodeExtension(context);
    await extension.activate();
}

export async function deactivate(): Promise<void> {
    if (extension) {
        await extension.deactivate();
    }
}