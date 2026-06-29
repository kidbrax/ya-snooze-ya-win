import React, { Fragment } from 'react'
import styled from 'styled-components'
import { saveSettings } from '../../core/settings'
import TSDialog from './TSDialog'
import SupportLinks from './SupportLinks'

export default function SupportTSDialog() {
  const handleDontShowAgain = async () => {
    await saveSettings({ showSupportReminders: false })
    window.close()
  }

  return (
    <TSDialog
      title="Support Ya Snooze, Ya Win"
      headline="Enjoying Ya Snooze, Ya Win?"
      subheader={
        <Fragment>
          Thanks for using Ya Snooze, Ya Win! It's free and community-supported. Here are some ways to show
          your appreciation:
        </Fragment>
      }
      closeBtnText={null}
    >
      <SupportLinks />

      <CloseButtons>
        <CloseButton onClick={handleDontShowAgain}>Don&apos;t show again</CloseButton>
        <CloseButton onClick={() => window.close()}>Maybe later</CloseButton>
      </CloseButtons>
    </TSDialog>
  )
}

const CloseButtons = styled.div`
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const CloseButton = styled.button`
  margin-top: 0;
  background: none;
  border: none;
  color: #999;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 12px;

  &:hover {
    color: #666;
    text-decoration: underline;
  }
`
