import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { getSelectedVoiceEngine, localeDisplayName } from '../../shared/voice';

export async function getRenderVoiceLocales(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const engine = await getSelectedVoiceEngine.call(this, 'rendervoice');
	const voices = engine?.supported_voices ?? [];
	const locales = Array.from(new Set(voices.flatMap((v) => v.locales ?? []))).sort();

	return locales.map((code) => ({
		name: localeDisplayName(code),
		value: code,
	}));
}
