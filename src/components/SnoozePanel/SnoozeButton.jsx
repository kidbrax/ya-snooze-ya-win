import React from 'react';
import styled, { css, withTheme } from 'styled-components';
import ProCornerRibbon from './ProCornerRibbon';

const SNOOZE_CLICK_EFFECT_TIME = 400;

const SnoozeButton = (props) => {
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

export default withTheme(SnoozeButton);

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
  background-color: ${(props) => props.theme.snoozePanel.bgColor};
  transition: background-color 0.1s;

  & * {
    pointer-events: none;
  }

  :hover {
    background-color: ${(props) => props.theme.snoozePanel.hoverColor};
  }

  ${(props) =>
    props.$focused &&
    css`
      background-color: ${props.theme.snoozePanel.hoverColor};
    `}

  ${(props) =>
    props.$pressed &&
    css`
      transition: background-color ${SNOOZE_CLICK_EFFECT_TIME}ms;
      background-color: ${props.theme.primary} !important;
    `};
`;

const Title = styled.div`
  font-size: 15px;
  color: ${(props) => props.theme.snoozePanel.buttonTextColor};
  font-weight: 500;
  transition: color ${SNOOZE_CLICK_EFFECT_TIME}ms;

  ${(props) =>
    props.$pressed &&
    css`
      color: #fff;
    `};
`;

const TimeLabel = styled.div`
  margin-left: 8px;
  font-size: 13px;
  opacity: 0.6;
  color: ${(props) => props.theme.snoozePanel.buttonTextColor};
  transition: color ${SNOOZE_CLICK_EFFECT_TIME}ms;

  ${(props) =>
    props.$pressed &&
    css`
      color: #fff;
      opacity: 0.85;
    `};
`;

