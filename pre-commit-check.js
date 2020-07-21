const git = require('simple-git/promise')

let error = null

async function validateChanges() {
    // Check if there are any files staged
    const diffSummary = await git().diffSummary(['--staged'])
    if (diffSummary.files.length === 0) {
        return
    }

    const URLsFile = diffSummary.files.find(f => Object.is(f.file, 'urls-to-purge.txt'))
    if (URLsFile === undefined) {
        error = 'The urls-to-purge.txt is not staged. Did you forget to update it?'
        return
    }
}

validateChanges()
.then(() => {
    if (error !== null) {
        console.log('Error: ' + error)
        process.exit(1)
    }
    console.log('urls-to-purge.txt is staged. Everything is OK.')
})
.catch((err) => {
    console.error(err)
})