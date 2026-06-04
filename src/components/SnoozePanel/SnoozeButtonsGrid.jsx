import React from 'react';
import styled from 'styled-components';
import SnoozeButton from './SnoozeButton';

const SnoozeButtonsGrid = (props) => {
  const { buttons } = props;
  return (
    <ButtonsGrid>
      {buttons.map(button => (
        <SnoozeButton key={button.id} {...button} />
      ))}
    </ButtonsGrid>
  );
}

const ButtonsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  background-color: ${(props) => props.theme.snoozePanel.border};
  width: 326px;
`;

export default SnoozeButtonsGrid;
