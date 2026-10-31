'use client'
import { useState } from 'react'
import type { AvatarProps } from '@cognitap/radiant'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import {
  brokenPhoto,
  CommentAuthor,
  ListMembers,
  photo,
  ProfileButton,
  ProfileIdentity,
  TeamStack
} from './AvatarExample'
export type AvatarTask = 'identity' | 'members' | 'comment' | 'button' | 'team'
type Source = 'image' | 'missing' | 'fallback'
const sources = { image: photo, missing: brokenPhoto, fallback: undefined }
export function AvatarPlayground({ task = 'identity' }: { task?: AvatarTask }) {
  const [controlSize, setSize] = useState<NonNullable<AvatarProps['controlSize']>>('medium'),
    [source, setSource] = useState<Source>('image'),
    [nameShown, setNameShown] = useState(true),
    [broken, setBroken] = useState(true)
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Control size"
            value={controlSize}
            options={['small', 'medium', 'large']}
            onChange={setSize}
          />
          {task === 'identity' && (
            <SelectControl
              label="Image source"
              value={source}
              options={['image', 'missing', 'fallback']}
              optionLabels={{
                image: 'Available image',
                missing: 'Unavailable image',
                fallback: 'No image'
              }}
              onChange={setSource}
            />
          )}
        </div>
        {task === 'identity' && (
          <div className="action-toggles">
            <label>
              <input
                type="checkbox"
                checked={nameShown}
                onChange={event => setNameShown(event.target.checked)}
              />
              Use adjacent name
            </label>
          </div>
        )}
        {task === 'comment' && (
          <div className="action-toggles">
            <button
              type="button"
              onClick={() => setBroken(current => !current)}
            >
              {broken ? 'Restore photo' : 'Break photo'}
            </button>
          </div>
        )}
      </DemoControls>
      <DemoPreview>
        {task === 'members' ? (
          <ListMembers controlSize={controlSize} />
        ) : task === 'comment' ? (
          <CommentAuthor
            controlSize={controlSize}
            src={broken ? brokenPhoto : photo}
          />
        ) : task === 'button' ? (
          <ProfileButton controlSize={controlSize} />
        ) : task === 'team' ? (
          <TeamStack controlSize={controlSize} />
        ) : (
          <ProfileIdentity
            controlSize={controlSize}
            src={sources[source]}
            nameShown={nameShown}
          />
        )}
      </DemoPreview>
    </>
  )
}
