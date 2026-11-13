import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { ldxHubApiRequest } from './transport';

export type VoiceService = 'castvoice' | 'rendervoice';

type Conversion = {
	from: string;
	to: string;
};

type Recognizer = {
	code: string;
	display_name?: string;
};

type Voice = {
	code: string;
	display_name?: string;
	locales?: string[];
};

export type VoiceEngine = {
	id: string;
	display_name?: string;
	description?: string;
	supported_conversions?: Conversion[];
	supported_options?: string[];
	supported_recognizers?: Recognizer[];
	supported_voices?: Voice[];
};

type EnginesResponse = {
	data?: VoiceEngine[];
};

/** Reads the engines of a voice service (GET /castvoice/engines or /rendervoice/engines). */
export async function getVoiceEngines(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	service: VoiceService,
): Promise<VoiceEngine[]> {
	const response = (await ldxHubApiRequest.call(
		this,
		'GET',
		`/${service}/engines`,
	)) as EnginesResponse;
	return response.data ?? [];
}

export async function getSelectedVoiceEngine(
	this: ILoadOptionsFunctions,
	service: VoiceService,
): Promise<VoiceEngine | undefined> {
	const engineId = this.getCurrentNodeParameter('engine') as string | undefined;
	if (!engineId) {
		return undefined;
	}
	const engines = await getVoiceEngines.call(this, service);
	return engines.find((e) => e.id === engineId);
}

export function toEngineOptions(engines: VoiceEngine[]): INodePropertyOptions[] {
	return engines.map((e) => ({
		name: e.display_name ?? e.id,
		value: e.id,
		description: e.description,
	}));
}

/** Output formats the engine can produce (the "to" side of its supported_conversions). */
export function toOutputFormatOptions(engine: VoiceEngine | undefined): INodePropertyOptions[] {
	const conversions = engine?.supported_conversions ?? [];
	const formats = Array.from(new Set(conversions.map((c) => c.to))).sort();
	return formats.map((f) => ({
		name: f.toUpperCase(),
		value: f,
	}));
}

const FORMAT_BY_MIME_TYPE: Record<string, string> = {
	'audio/wav': 'wave',
	'audio/wave': 'wave',
	'audio/x-wav': 'wave',
	'audio/vnd.wave': 'wave',
	'audio/mpeg': 'mp3',
	'audio/mp3': 'mp3',
	'text/plain': 'text',
};

const FORMAT_BY_EXTENSION: Record<string, string> = {
	wav: 'wave',
	wave: 'wave',
	mp3: 'mp3',
	txt: 'text',
	text: 'text',
};

/**
 * Maps an input file to the format names used in supported_conversions ('wave', 'mp3', 'text').
 * Returns undefined when the file type cannot be told, so the API decides.
 */
export function detectInputFormat(meta: {
	fileName?: string;
	fileExtension?: string;
	mimeType?: string;
}): string | undefined {
	const mimeType = (meta.mimeType ?? '').split(';')[0].trim().toLowerCase();
	if (FORMAT_BY_MIME_TYPE[mimeType]) {
		return FORMAT_BY_MIME_TYPE[mimeType];
	}
	const extension = (meta.fileExtension ?? meta.fileName?.split('.').pop() ?? '').toLowerCase();
	return FORMAT_BY_EXTENSION[extension];
}

/**
 * Checks, before uploading, that the engine accepts the input format, can produce the output format
 * from it, and supports the options that were set. Skips what the engine list does not describe.
 */
export function assertVoiceJobSupported(
	this: IExecuteFunctions,
	itemIndex: number,
	label: string,
	engine: VoiceEngine | undefined,
	check: { inputFormat?: string; outputFormat: string; options: string[] },
): void {
	if (!engine) {
		return;
	}
	const conversions = engine.supported_conversions ?? [];
	if (conversions.length > 0) {
		const inputs = Array.from(new Set(conversions.map((c) => c.from)));
		if (check.inputFormat && !inputs.includes(check.inputFormat)) {
			throw new NodeOperationError(
				this.getNode(),
				`${label} engine ${engine.id} does not accept ${check.inputFormat} input (accepted: ${inputs.join(', ')})`,
				{ itemIndex },
			);
		}
		const outputs = conversions
			.filter((c) => !check.inputFormat || c.from === check.inputFormat)
			.map((c) => c.to);
		if (!outputs.includes(check.outputFormat)) {
			throw new NodeOperationError(
				this.getNode(),
				`${label} engine ${engine.id} cannot produce ${check.outputFormat}${check.inputFormat ? ` from ${check.inputFormat}` : ''} (available: ${Array.from(new Set(outputs)).join(', ')})`,
				{ itemIndex },
			);
		}
	}
	const supportedOptions = engine.supported_options ?? [];
	for (const option of check.options) {
		if (!supportedOptions.includes(option)) {
			throw new NodeOperationError(
				this.getNode(),
				`${label} engine ${engine.id} does not support the option ${option}`,
				{ itemIndex },
			);
		}
	}
}

export function localeDisplayName(code: string): string {
	try {
		const name = new Intl.DisplayNames(['en'], { type: 'language' }).of(code);
		return name && name !== code ? `${name} (${code})` : code;
	} catch {
		return code;
	}
}
