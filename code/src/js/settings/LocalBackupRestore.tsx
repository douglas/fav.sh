import React, { useState } from 'react'
import {
  SectionContainer,
  SectionHeader,
  SectionContent,
  DownloadInputContainer,
  SettingsTextField,
  SettingsButton,
  PaddedAction,
} from './common'
import { Typography } from '@material-ui/core'
import { getBookmarksFromStorage } from '~/browser/getBookmarksFromStorage'
import { BookmarkState } from '~/store/modules/bookmarks'
import { saveAs } from 'file-saver'
import { FileUploader } from '~/components/FileUploader'
import {
  transformExportBookmark,
  transformImportBookmark,
  validateBookmark,
  generateBookmarkGuid,
} from '~/helpers'
import { Bookmark, ExportedBookmark } from '~/types/Bookmark'

export const LocalRestore = () => {
  const handleFile = (content: any) => {
    /** File handling
     *  1. Validate the file
     *  2. Get the current redux store
     *  3. Deserialize the store
     *  4. Insert the boomkmarks in the store
     *  5. Serialize the store again
     *  6. Set the new store
     *
     *  This should be as generic as possible
     *  because we will be re-using the component
     *  when we will work on gist restoration
     */
    const error = () => alert('Could not import bookmarks')

    let exportedBookmarks: BookmarkState = {}
    try {
      // Convert the JSON file to a JS object
      const parsedBookmarks = JSON.parse(content)

      // Validate every bookmark inside
      parsedBookmarks.forEach((bookmark: ExportedBookmark) => {
        if (!validateBookmark(bookmark)) {
          error()
          return
        } else {
          const bookmarkGuid = generateBookmarkGuid()
          exportedBookmarks = {
            ...exportedBookmarks,
            [bookmarkGuid]: transformImportBookmark(bookmark, bookmarkGuid),
          }
        }
      })
    } catch {
      // Catch case if the JSON file is invalid
      error()
      return
    } finally {
      console.log('Import Complete!!!', exportedBookmarks)
      return
    }
  }

  return (
    <SectionContainer>
      <SectionHeader>Restore</SectionHeader>
      <SectionContent>
        <Typography>
          Restore your bookmarks from a JSON file on your computer
        </Typography>
        <PaddedAction>
          <FileUploader onFile={handleFile} />
        </PaddedAction>
      </SectionContent>
    </SectionContainer>
  )
}

export const LocalBackup = () => {
  const [filename, setFilename] = useState('')

  const handleBackup = () => {
    getBookmarksFromStorage().then((bookmarks) => {
      if (bookmarks && Object.keys(bookmarks as BookmarkState).length > 0) {
        // Transform the bookmarks
        const transformedBookmarks = Object.keys(
          bookmarks as BookmarkState
        ).map((key) => {
          return transformExportBookmark(
            (bookmarks as BookmarkState)[key] as Bookmark
          )
        })

        // Stringify the results
        const bookmarksToExport = JSON.stringify(transformedBookmarks, null, 2)

        // Convert to a blob
        const bookmarksBlob = new Blob([bookmarksToExport], {
          type: 'application/json',
        })

        // Ssve the file to the users computer
        saveAs(bookmarksBlob, `${filename}.json`)
        return
      }
    })
  }

  return (
    <SectionContainer>
      <SectionHeader>Backup</SectionHeader>
      <SectionContent>
        <Typography>
          Backup your bookmarks to a JSON file on your computer
        </Typography>
        <DownloadInputContainer>
          <SettingsTextField
            value={filename}
            onChange={setFilename}
            label="Filename"
          />
          <SettingsButton
            disabled={!filename}
            onClick={handleBackup}
            text="Download"
          />
        </DownloadInputContainer>
      </SectionContent>
    </SectionContainer>
  )
}
