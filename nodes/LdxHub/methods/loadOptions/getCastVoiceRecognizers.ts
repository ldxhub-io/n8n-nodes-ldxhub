import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { getSelectedVoiceEngine } from '../../shared/voice';

export async function getCastVoiceRecognizers(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const engine = await getSelectedVoiceEngine.call(this, 'castvoice');
	const recognizers = engine?.supported_recognizers ?? [];

	return recognizers.map((r) => ({
		name: r.display_name ?? r.code,
		value: r.code,
	}));
}
