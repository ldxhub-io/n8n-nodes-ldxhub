import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { ldxHubApiRequest } from '../../shared/transport';

type Language = {
	code: string;
	display_name?: string;
};

type Engine = {
	id: string;
	supported_languages?: Language[];
};

type EnginesResponse = {
	data?: Engine[];
};

export async function getRenderOcrLanguages(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const engineId = this.getCurrentNodeParameter('engine') as string | undefined;
	if (!engineId) {
		return [];
	}

	const response = (await ldxHubApiRequest.call(
		this,
		'GET',
		'/renderocr/engines',
	)) as EnginesResponse;

	const engine = response.data?.find((e) => e.id === engineId);
	const languages = engine?.supported_languages ?? [];

	return languages.map((lang) => ({
		name: lang.display_name ?? lang.code,
		value: lang.code,
	}));
}
