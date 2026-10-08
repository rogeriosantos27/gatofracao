/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class SoundManager {
  private ctxAudio: AudioContext | null = null;

  public garantirContexto(): void {
    if (typeof window === 'undefined') return;
    if (!this.ctxAudio) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctxAudio = new AudioCtx();
      }
    }
    if (this.ctxAudio && this.ctxAudio.state === 'suspended') {
      this.ctxAudio.resume().catch((err) => console.warn('AudioContext resume failed:', err));
    }
  }

  public playTone(
    frequencia: number,
    tipo: OscillatorType,
    duracao: number,
    volume: number,
    deslizarPara: number = 0
  ): void {
    this.garantirContexto();
    if (!this.ctxAudio) return;

    try {
      const osc = this.ctxAudio.createOscillator();
      const ganho = this.ctxAudio.createGain();

      osc.type = tipo;
      osc.frequency.setValueAtTime(frequencia, this.ctxAudio.currentTime);

      if (deslizarPara > 0) {
        osc.frequency.exponentialRampToValueAtTime(deslizarPara, this.ctxAudio.currentTime + duracao);
      }

      ganho.gain.setValueAtTime(volume, this.ctxAudio.currentTime);
      ganho.gain.exponentialRampToValueAtTime(0.01, this.ctxAudio.currentTime + duracao);

      osc.connect(ganho);
      ganho.connect(this.ctxAudio.destination);

      osc.start();
      osc.stop(this.ctxAudio.currentTime + duracao);
    } catch (e) {
      console.warn('PlayTone failed:', e);
    }
  }

  public passo(): void {
    // Som curto e suave de passo
    this.playTone(80 + Math.random() * 40, 'triangle', 0.08, 0.03);
  }

  public click(): void {
    this.playTone(400, 'sine', 0.05, 0.08);
  }

  public coleta(): void {
    this.garantirContexto();
    // Arpejo ascendente de coleta de item
    this.playTone(523.25, 'square', 0.08, 0.1); // C5
    setTimeout(() => this.playTone(659.25, 'square', 0.08, 0.1), 80); // E5
    setTimeout(() => this.playTone(783.99, 'square', 0.08, 0.1), 160); // G5
    setTimeout(() => this.playTone(1046.50, 'square', 0.2, 0.12), 240); // C6
  }

  public ataqueAcerto(): void {
    this.playTone(300, 'sawtooth', 0.25, 0.1, 1200);
  }

  public danoSofrido(): void {
    this.playTone(180, 'sawtooth', 0.35, 0.15, 40);
  }

  public vitoria(): void {
    this.garantirContexto();
    this.playTone(587.33, 'square', 0.12, 0.12); // D5
    setTimeout(() => this.playTone(659.25, 'square', 0.12, 0.12), 120); // E5
    setTimeout(() => this.playTone(698.46, 'square', 0.12, 0.12), 240); // F5
    setTimeout(() => this.playTone(783.99, 'square', 0.35, 0.15), 360); // G5
  }
}

export const Som = new SoundManager();
