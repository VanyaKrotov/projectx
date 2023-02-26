import React from "react";
import { renderToString } from "react-dom/server";

import { di } from "shared/constants";

import { ViewService } from "entities/view/service";
import CodeView from "components/code-view";

interface Props {
  path: string;
}

const viewService = di.inject(ViewService)!;

interface CodeViewResult {
  params: Record<string, string>;
  content: string;
  start: number;
  end: number;
}

function parseParams(data: string): Record<string, string> {
  const result: Record<string, string> = {};
  const clearData = data.replace(/"/g, "");
  const items = clearData.split(" ").filter((e) => e);
  for (const item of items) {
    const [name, value] = item.split("=");
    result[name.trim()] = value;
  }

  return result;
}

function findCodeView(content: string): CodeViewResult[] {
  const result: CodeViewResult[] = [];
  let index = 0;
  while ((index = content.indexOf("<codeview", index)) !== -1) {
    let trashCount = 1;
    let endIndex = content.indexOf(">", index);
    let temp;
    let tagContent = "";
    if (content[endIndex - 1] !== "/") {
      temp = endIndex;
      trashCount = 11;
      endIndex = content.indexOf("</codeview>", temp);
      tagContent = content.slice(temp + 1, endIndex);
    }

    const params = parseParams(content.slice(index + 10, temp || endIndex - 1));

    result.push({
      content: tagContent.trim(),
      params,
      start: index,
      end: endIndex + trashCount,
    });

    index = endIndex;
  }

  return result;
}

async function prepareContent(content: string): Promise<string> {
  const codeSections = findCodeView(content);
  let resultContent = content;
  for (const section of codeSections) {
    const ss = content.slice(section.start, section.end);
    const code =
      section.content ||
      (await viewService.loadPageSection(section.params.path));

    resultContent = resultContent.replace(
      ss,
      renderToString(<CodeView {...section.params}>{code}</CodeView>)
    );
  }

  return resultContent;
}

export async function loadContent(path: string): Promise<string> {
  const rawContent = await viewService.loadPageSection(path);

  return prepareContent(rawContent);
}
