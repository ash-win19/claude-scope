import { Injectable, Logger } from '@nestjs/common';
import { SynthesisInput, SynthesisOutput } from './types/synthesis.types';
import { RecordingTimeline } from './types/timeline.types';
import { InspectionResult } from './types/inspection.types';

@Injectable()
export class SynthesisService {
  private readonly logger = new Logger(SynthesisService.name);

  synthesize(input: SynthesisInput): SynthesisOutput {
    const { timeline, seedUrl, agentTarget, title, notes, inspection } = input;

    const sections: string[] = [];

    // Section 1: Recording metadata
    sections.push(this.buildHeader(title, seedUrl, agentTarget));

    // Section 2: Visual timeline (from vision lane)
    sections.push(this.buildVisualTimeline(timeline));

    // Section 3: Structural inspection (from Playwright lane)
    sections.push(this.buildStructuralInspection(inspection));

    // Section 4: User notes (if provided)
    if (notes?.trim()) {
      sections.push(`## Additional Context\n\n${notes.trim()}`);
    }

    // Section 5: Agent-specific instructions
    sections.push(this.buildAgentInstructions(agentTarget));

    const prompt = sections.join('\n\n---\n\n');
    const urlsInspected = inspection.urlsInspected;
    const summary = timeline.summary;

    this.logger.log(
      `Synthesized prompt: ${prompt.length} chars, ${urlsInspected.length} URLs inspected`,
    );

    return { prompt, summary, urlsInspected };
  }

  private buildHeader(
    title: string,
    seedUrl: string,
    agentTarget: string,
  ): string {
    return [
      `# Recording Analysis: ${title}`,
      '',
      `**URL:** ${seedUrl}`,
      `**Agent Target:** ${agentTarget}`,
    ].join('\n');
  }

  private buildVisualTimeline(timeline: RecordingTimeline): string {
    const durationSec = (timeline.durationMs / 1000).toFixed(1);
    const lines = [
      '## Visual Timeline',
      '',
      `_${timeline.frameCount} frames analyzed over ${durationSec}s. ${timeline.events.length} events detected._`,
      '',
      timeline.summary,
    ];

    if (timeline.failedFrames > 0) {
      lines.push('', `> ${timeline.failedFrames} frame(s) failed vision analysis.`);
    }

    if (timeline.events.length > 0) {
      lines.push('', '### Events', '');
      for (const event of timeline.events) {
        const timeSec = (event.timestampMs / 1000).toFixed(1);
        lines.push(`**[${timeSec}s] ${event.type.toUpperCase()}** — ${event.summary}`);
        if (event.elements.length > 0) {
          for (const el of event.elements.slice(0, 10)) {
            const state = el.state ? ` (${el.state})` : '';
            lines.push(`  - \`${el.type}\`: ${el.label}${state}`);
          }
        }
      }
    }

    return lines.join('\n');
  }

  private buildStructuralInspection(inspection: InspectionResult): string {
    const lines = [
      '## Structural Inspection',
      '',
      `_Playwright inspected ${inspection.urlsInspected.length} URL(s) in ${inspection.durationMs}ms._`,
      '',
    ];

    for (const snap of inspection.snapshots) {
      lines.push(`### ${snap.url}`);
      if (!snap.success) {
        lines.push(`_Inspection failed: ${snap.error}_`);
        lines.push('');
        continue;
      }
      lines.push('');
      lines.push(`| Element | Count |`);
      lines.push(`|---------|-------|`);
      lines.push(`| Buttons | ${snap.counts.buttons} |`);
      lines.push(`| Inputs | ${snap.counts.inputs} |`);
      lines.push(`| Links | ${snap.counts.links} |`);
      lines.push(`| Headings | ${snap.counts.headings} |`);
      lines.push(`| Images | ${snap.counts.images} |`);
      lines.push(`| **Total** | **${snap.counts.total}** |`);
      if (snap.ariaTree) {
        lines.push('');
        lines.push('**ARIA Snapshot:**');
        lines.push('```yaml');
        const truncated = snap.ariaTree.length > 3000
          ? snap.ariaTree.slice(0, 3000) + '\n# ... truncated at 3000 chars'
          : snap.ariaTree;
        lines.push(truncated);
        lines.push('```');
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  private buildAgentInstructions(agentTarget: string): string {
    const instructions: Record<string, string> = {
      CLAUDE_CODE:
        'Use this analysis to understand the UI state and reproduce or fix the behavior described above. Focus on the component tree structure and state transitions.',
      CODEX:
        'Use this analysis to understand the application flow and generate appropriate code changes. Pay attention to the ARIA tree for component structure.',
      CURSOR:
        'Reference this analysis when making inline code edits. The timeline shows the sequence of UI states observed.',
      RAW: 'Raw analysis output. Interpret the timeline events and component tree as needed for your workflow.',
    };

    return [
      '## Instructions',
      '',
      instructions[agentTarget] || instructions.RAW,
    ].join('\n');
  }
}
