import { LocalSystemApiName, LocalSystemIdentifier } from '@lobechat/builtin-tool-local-system';
import { getBuiltinInspector } from '@lobechat/builtin-tools/inspectors';
import { registerBuiltinToolSurfaces } from '@lobechat/builtin-tools/register';
import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import Inspectors from './index';

beforeAll(() => {
  registerBuiltinToolSurfaces();
});

/**
 * Regression guard for the collapsed tool-row title. The row used to swap the
 * tool's rich inspector for a distilled "<action> <keyword>" summary, which
 * reduced every command call to its program name (e.g. two different
 * `agent-browser` runs both collapsed to "执行代码 agent-browser"). The rich
 * inspector must render in BOTH collapsed and expanded states; only tools
 * without a registered inspector fall back to the plain ToolTitle.
 */
describe('Tool Inspectors title selection', () => {
  it('renders the registered rich inspector for runCommand with the full command', () => {
    expect(getBuiltinInspector(LocalSystemIdentifier, LocalSystemApiName.runCommand)).toBeDefined();

    render(
      <Inspectors
        apiName={LocalSystemApiName.runCommand}
        arguments={JSON.stringify({ command: 'agent-browser screenshot --full-page' })}
        identifier={LocalSystemIdentifier}
        result={{ content: 'ok' }}
        toolCallId="test-run-command"
      />,
    );

    // The rich inspector's chip carries the full command; the distilled
    // ToolTitle would show only the bare program name ("agent-browser").
    expect(screen.getByText('agent-browser screenshot --full-page')).toBeInTheDocument();
    expect(screen.queryByText('agent-browser')).not.toBeInTheDocument();
  });

  it('falls back to the plain ToolTitle for tools without a registered inspector', () => {
    render(
      <Inspectors
        apiName="list_issues"
        arguments={JSON.stringify({ query: 'LOBE' })}
        identifier="some-mcp-server"
        result={{ content: 'ok' }}
        toolCallId="test-mcp-tool"
      />,
    );

    // ToolTitle title-cases the apiName and distills the query into the
    // keyword slot.
    expect(screen.getByText('List_issues')).toBeInTheDocument();
    expect(screen.getByText('LOBE')).toBeInTheDocument();
  });
});
