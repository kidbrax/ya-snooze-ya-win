// @flow
import React from 'react';
import type { ComponentType } from 'react';
import styled, { css, withTheme } from 'styled-components';
import ProCornerRibbon from './ProCornerRibbon';

// Theme type definition
type Theme = {
  primary: string,
  snoozePanel: {
    bgColor: string,
    hoverColor: string,
    buttonTextColor: string,
    whiteIcons: boolean,
  },
};

type StyledProps = {
  theme: Theme,
  focused?: boolean,
  pressed?: boolean,
};

export type Props = {
  id: string,
  title: string,
  icon: string,
  activeIcon: string,
  tooltip: string,
  focused: boolean,
  pressed: boolean,
  proBadge: boolean,
  when?: Date,
  onClick: Event => void,
  onMouseEnter: () => void,
  onMouseLeave: () => void,
  // passed by withTheme:
  theme?: Theme,
};

const SNOOZE_CLICK_EFFECT_TIME = 400;

const SnoozeButton: ComponentType<Props> = (props: Props): React.Node => {
  const {
    title,
    tooltip,
    when,
    focused,
    pressed,
    proBadge,
    onClick,
    onMouseLeave,
    onMouseEnter,
  } = props;

  // Show the tooltip time string for options that have a concrete wakeup time
  const timeLabel = when ? tooltip : null;

  return (
    <Button
      $pressed={pressed}
      $focused={focused}
      onMouseDown={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Title $pressed={pressed}>{title}</Title>
      {timeLabel && <TimeLabel $pressed={pressed}>({timeLabel})</TimeLabel>}
      {proBadge && <ProCornerRibbon white={pressed ? true : undefined} />}
    </Button>
  );
}

export default (withTheme(SnoozeButton): ComponentType<Props>);

const Button = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  width: 100%;
  height: 44px;
  margin: 0;
  padding: 0 16px;
  white-space: nowrap;
  box-sizing: border-box;
  border: none;
  cursor: pointer;
  outline: inherit;
  background-color: ${(props: StyledProps) => props.theme.snoozePanel.bgColor};
  transition: background-color 0.1s;

  & * {
    pointer-events: none;
  }

  :hover {
    background-color: ${(props: StyledProps) => props.theme.snoozePanel.hoverColor};
  }

  ${(props: StyledProps) =>
    props.$focused &&
    css`
      background-color: ${props.theme.snoozePanel.hoverColor};
    `}

  ${(props: StyledProps) =>
    props.$pressed &&
    css`
      transition: background-color ${SNOOZE_CLICK_EFFECT_TIME}ms;
      background-color: ${props.theme.primary} !important;
    `};
`;

const Title = styled.div`
  font-size: 15px;
  color: ${(props: StyledProps) => props.theme.snoozePanel.buttonTextColor};
  font-weight: 500;
  transition: color ${SNOOZE_CLICK_EFFECT_TIME}ms;

  ${(props: StyledProps) =>
    props.$pressed &&
    css`
      color: #fff;
    `};
`;

const TimeLabel = styled.div`
  margin-left: 8px;
  font-size: 13px;
  opacity: 0.6;
  color: ${(props: StyledProps) => props.theme.snoozePanel.buttonTextColor};
  transition: color ${SNOOZE_CLICK_EFFECT_TIME}ms;

  ${(props: StyledProps) =>
    props.$pressed &&
    css`
      color: #fff;
      opacity: 0.85;
    `};
`;

