export const NotesApi = {
  getPinnedPaginated: () => {
    // get pinned saved notes paginated in a list
  },
  getOthersPaginated: () => {
    // get saved notes paginated in a list
  },
  getById: () => {
    // get single note by id
    // if locked, require password
  },
  create: () => {
    // create a new note
  },
  update: () => {
    // update specific fields of a note by id
  },
  updatePinnedOrder: () => {
    // after reordering the PINNED notes, send the note id, with the old and new index ( on FE, enter drag mode )
  },
  updateOrder: () => {
    // after reordering the notes, send the note id, with the old and new index ( on FE, enter drag mode )
  },
  findWord: () => {
    // search for a word in the note title or the note body
  },
  delete: () => {
    // delete a note forever ( ask for password on locked notes )
  },
  protect: () => {
    // encrypt a note with a password ( encrypt with the password locally and send the note encrypted )
    // DON'T store passwords
  },
  expose: () => {
    // decrypt a note and override existing encrypted note with decrypted text
  },
  pin: () => {
    // pin the note and bring it to the top
  },
  unPin: () => {
    // unpin the note and bring it to the top of the other notes
  },
};
