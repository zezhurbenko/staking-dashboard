// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { Toggle } from 'types';
import {
  AssistantContextInterface,
  AssistantDefinition,
  AssistantItem,
  AssistantContextProps,
} from 'types/assistant';
import { ASSISTANT_CONFIG } from 'config/assistant';
import { APIContextInterface } from 'types/api';
import { useApi } from './Api';

export const AssistantContext =
  React.createContext<AssistantContextInterface | null>(null);

export const useAssistant = () => React.useContext(AssistantContext);

export const AssistantProvider = (props: AssistantContextProps) => {
  const { network } = useApi() as APIContextInterface;

  // store whether assistant is open and whether it should transition
  const [open, setOpen] = useState<{
    state: Toggle;
    transition: number;
  }>({
    state: Toggle.Closed,
    transition: 0,
  });

  // store the current page of assistant
  const [page, _setPage] = useState<string>('overview');

  // store the active section of assistant (home or item)
  const [section, setSection] = useState<number>(0);

  // store assistant height
  const [height, setHeight] = useState<number>(0);

  // store currently active inner definition of assistant
  const [innerDefinition, _setInnerDefinition] = useState<AssistantDefinition>({
    title: '',
    description: [''],
  });

  const fillDefinitionVariables = (d: AssistantDefinition) => {
    // replace UNIT with network.unit
    return d;
  };

  const setPage = (newPage: string) => {
    _setPage(newPage);
  };

  const getDefinition = (key: string, title: string) => {
    const definition = ASSISTANT_CONFIG.find(
      (item: AssistantItem) => item.key === key
    )?.definitions?.find((item: AssistantDefinition) => item.title === title);

    if (definition === undefined) {
      return undefined;
    }
    return fillDefinitionVariables(definition);
  };

  const setInnerDefinition = (meta: AssistantDefinition) => {
    meta = fillDefinitionVariables(meta);
    _setInnerDefinition(meta);
  };

  const toggle = () => {
    setOpen({
      state: Toggle.Closed ? Toggle.Open : Toggle.Closed,
      transition: 0,
    });
  };

  const openAssistant = () => {
    setOpen({
      state: Toggle.Open,
      transition: 0,
    });
  };

  const closeAssistant = () => {
    setOpen({
      state: Toggle.Closed,
      transition: 0,
    });

    // short timeout to hide back to list
    setTimeout(() => {
      setSection(0);
    }, 150);
  };

  const setActiveSection = (index: number) => {
    setOpen({
      state: open.state,
      transition: 1,
    });
    setSection(index);
  };

  const goToDefinition = (_page: string, _title: string) => {
    const definition = getDefinition(_page, _title);

    if (innerDefinition === definition && open.state === Toggle.Open) {
      closeAssistant();
    } else if (definition !== undefined) {
      setPage(_page);
      setSection(1);
      setInnerDefinition(definition);

      // short timeout to hide inner transition
      setTimeout(() => openAssistant(), 60);
    }
  };

  const setAssistantHeight = (h: number) => {
    setHeight(h);
  };

  return (
    <AssistantContext.Provider
      value={{
        toggle,
        setPage,
        setInnerDefinition,
        getDefinition,
        openAssistant,
        closeAssistant,
        setActiveSection,
        goToDefinition,
        setAssistantHeight,
        height,
        page,
        innerDefinition,
        activeSection: section,
        open: open.state,
        transition: open.transition,
      }}
    >
      {props.children}
    </AssistantContext.Provider>
  );
};
