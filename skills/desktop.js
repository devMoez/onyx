// 🖥️ Desktop Control Skill — Onyx PC control via PowerShell
// Zero external npm deps — uses built-in Windows .NET

export const description = 'Full desktop control: mouse, keyboard, screenshot, windows';
export const commands = [
  'desktop:mouse:move x y', 'desktop:mouse:click [left|right|middle]',
  'desktop:mouse:position', 'desktop:keyboard:type "text"',
  'desktop:keyboard:press KEY', 'desktop:keyboard:hotkey K1 K2',
  'desktop:screen:capture', 'desktop:screen:resolution'
];

function runPS(code) {
  const { execSync } = await import('node:child_process');
  return execSync('powershell', ['-NoProfile', '-Command', code], {
    encoding: 'utf8', timeout: 15000, windowsHide: true
  }).trim();
}

export default async function desktop(command, ...args) {
  switch (command) {
    // ─── Mouse ───
    case 'mouse:move': {
      const x = Number(args[0]), y = Number(args[1]);
      runPS([System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(, ));
      return 🖥️ Moved to (, );
    }
    case 'mouse:click': {
      const btn = (args[0] || 'left').toLowerCase();
      const code = btn === 'right'
        ? Add-Type -AssemblyName System.Windows.Forms
           [System.Windows.Forms.Cursor]::Position = [System.Windows.Forms.Cursor]::Position
           [System.Windows.Forms.SendKeys]::SendWait('+{F10}')
        : Add-Type -AssemblyName System.Windows.Forms
            = '[DllImport(\"user32.dll\")]public static extern void mouse_event(uint f,uint dx,uint dy,uint dw,uint p);'
           Add-Type -MemberDefinition  -Name NativeMethods -Namespace Win32
           [Win32.NativeMethods]::mouse_event(0x02,0,0,0,0)
           [Win32.NativeMethods]::mouse_event(0x04,0,0,0,0);
      runPS(code);
      return 🖱️ Clicked ;
    }
    case 'mouse:position': {
      const result = runPS('Add-Type -AssemblyName System.Windows.Forms;  = [System.Windows.Forms.Cursor]::Position; Write-Output \",\"');
      return 📍 ;
    }

    // ─── Keyboard ───
    case 'keyboard:type': {
      const text = args.join(' ').replace(/'/g, "''").replace(/[{}()+\^%~\[\]]/g, '{$&}');
      runPS($wshell = New-Object -ComObject wscript.shell; .SendKeys(''));
      return ⌨️ Typed: "";
    }
    case 'keyboard:press': {
      const key = args[0] || '';
      runPS($wshell = New-Object -ComObject wscript.shell; .SendKeys('{}'));
      return ⌨️ Pressed ;
    }
    case 'keyboard:hotkey': {
      const keys = args.join(' ');
      runPS($wshell = New-Object -ComObject wscript.shell; .SendKeys('()'));
      return ⌨️ ;
    }

    // ─── Screen ───
    case 'screen:capture': {
      const { promises: fs } = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const filename = onyx-shot-.png;
      const outpath = path.join(__dirname, '..', 'shots', filename);

      await fs.mkdir(path.join(__dirname, '..', 'shots'), { recursive: true });
      const escaped = outpath.replace(/\\/g, '\\\\').replace(/'/g, "''");
      runPS(
        Add-Type -AssemblyName System.Windows.Forms,System.Drawing
         = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
         = New-Object System.Drawing.Bitmap .Width, .Height
         = [System.Drawing.Graphics]::FromImage()
        .CopyFromScreen(.X, .Y, 0, 0, .Size)
        .Save('')
        .Dispose(); .Dispose()
      );
      return 📸 Saved: shots/;
    }
    case 'screen:resolution': {
      const result = runPS(
        Add-Type -AssemblyName System.Windows.Forms
         = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
        Write-Output "x"
      );
      return 🖥️ ;
    }

    default:
      return 'Commands: mouse:move x y, mouse:click [btn], mouse:position, keyboard:type "text", keyboard:press KEY, screen:capture, screen:resolution';
  }
}
