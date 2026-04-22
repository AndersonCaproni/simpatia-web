import axios from "axios";

export async function generateSpeech(text, voiceName = "Charon", existingAudioCtx = null) {
    const response = await axios.post(
        "https://simpatia-api-112480462744.europe-west1.run.app/speech",
        { text, voiceName },
        { headers: { "Content-Type": "application/json" } }
    );

    const { data: base64, mimeType = "audio/L16;rate=24000" } = response.data;

    if (!base64) throw new Error("Resposta de áudio inválida");

    const binary = atob(base64);
    const buffer = new ArrayBuffer(binary.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);

    if (mimeType.includes("L16") || mimeType.includes("pcm")) {
        const sampleRate = parseInt(mimeType.match(/rate=(\d+)/)?.[1] || "24000");
        const wavBlob = encodeWAV(buffer, sampleRate);
        const url = URL.createObjectURL(wavBlob);
        return { type: "html5", url };
    }

    const url = URL.createObjectURL(new Blob([buffer], { type: mimeType }));
    return { type: "html5", url };
}

function encodeWAV(pcmBuffer, sampleRate) {
    const pcmData = new Uint8Array(pcmBuffer);
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + pcmData.length, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, pcmData.length, true);

    return new Blob([wavHeader, pcmData], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

export function playAudioObject(url, onEnd, existingAudioRef) {
    const audio = existingAudioRef && existingAudioRef.current ? existingAudioRef.current : new Audio();
    audio.src = url;

    audio.onended = () => {
        if (onEnd) onEnd();
        URL.revokeObjectURL(url);
    };
    audio.onerror = () => {
        if (onEnd) onEnd();
        URL.revokeObjectURL(url);
    };

    audio.play().catch(e => {
        console.warn("HTML5 audio play falhou:", e);
        if (onEnd) onEnd();
    });
    return audio;
}