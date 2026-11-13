import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { getSelectedVoiceEngine } from '../../shared/voice';

export async function getRenderVoiceVoices(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const engine = await getSelectedVoiceEngine.call(this, 'rendervoice');
	const locale = this.getCurrentNodeParameter('locale') as string | undefined;
	const voices = (engine?.supported_voices ?? []).filter(
		(v) => !locale || (v.locales ?? []).includes(locale),
	);

	return voices.map((v) => ({
		name: v.display_name ?? v.code,
		value: v.code,
	}));
}
