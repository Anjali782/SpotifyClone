let currentSong = new Audio();
let songs;
let currfolder;

async function secondsToMinutesAndSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${currfolder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currfolder}/`)[1].split(".mp3")[0].replaceAll("%20", " "))
        }
    }

    //show all songs
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML +
            `<li><img class = "invert" src = "music.svg" alt = "">
            <div class = "info" >
               <div > ${song.replaceAll("%20", " ")}</div>
            </div> 
            <div class = "playnow">
                <span> Play Now </span> 
                <img class = "playNowbtn" height = "20px" width = "20px" src = "play.svg" alt = "">
            </div></li>`;
    }
    //attach ev to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", element => {
                //console.log(element)
                //console.log(e.querySelector(".info").firstElementChild.innerHTML)
                playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
            })

        })
        //console.log(songs)
    return songs
}
const playMusic = (track) => {
    currentSong.src = `/${currfolder}/` + track + ".mp3"
        //console.log(currentSong.src)
    currentSong.play()
    play.src = "pause.svg"
    document.querySelector(".songinfo").innerHTML = track
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch("http://127.0.0.1:5500/songs/")
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
            let folderName = e.href.split("/")[4]
                //get the meta data of the folder
            let a1 = await fetch(`http://127.0.0.1:5500/songs/${folderName}/info.json`)
            let response1 = await a1.json();
            //console.log(response1)


            let cardContainer = document.querySelector(".cardContainer")
            cardContainer.innerHTML = cardContainer.innerHTML +
                `<div data-folder="${folderName}" class="card">
                    <div class="playcard">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="playcard">
                        <circle cx="12" cy="12" r="11" fill="rgb(30,215,96)" />
                        <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"></path>
                      </svg>
                    </div>
                    <img src="/songs/${folderName}/cover.jpg" alt="">
                    <h2>${response1.title}</h2>
                    <p>${response1.description}</p>
                </div>`
        }
    }
    //load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        //console.log(e)
        e.addEventListener("click", async item => {
            //console.log(item.currentTarget.dataset.folder)
            currfolder = item.currentTarget.dataset.folder
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            currentSong.src = `/${ currfolder }/` + songs[0] + ".mp3"
            document.querySelector(".songinfo").innerHTML = currentSong.src.split(`/${currfolder}/`)[1].split(".mp3")[0].replaceAll("%20", " ")
            document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
            play.src = "pause.svg"
            currentSong.play()
        })
    })
}
async function main() {
    await getSongs("songs/LearnEnglish")

    //get all albums
    displayAlbums()

    //attach event listner to play prev and next
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            if (currentSong.src == '') {
                currentSong.src = `/${ currfolder }/` + songs[0] + ".mp3"
                    //console.log(currentSong.src)
            }
            document.querySelector(".songinfo").innerHTML = currentSong.src.split(`/${currfolder}/`)[1].split(".mp3")[0].replaceAll("%20", " ")
            document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
            currentSong.play()
            play.src = "pause.svg"
        } else {
            currentSong.pause()
            play.src = "play.svg"
        }
    })

    //listen for time update event
    currentSong.addEventListener("timeupdate", async() => {
        const currenttime = await secondsToMinutesAndSeconds(currentSong.currentTime);
        const totalDuration = await secondsToMinutesAndSeconds(currentSong.duration);

        document.querySelector(".songtime").innerHTML = `
        ${currenttime} / ${totalDuration}`;
        //console.log(document.querySelector(".songtime").innerHTML);

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    //add an eventlisten to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    //eventlistner for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //close left
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%"
    })

    //add ev to prev and next
    previous.addEventListener("click", () => {
        if (currentSong.src != '') {
            //console.log(currentSong.src.split("/songs/")[1].split(".mp3")[0])
            let index = songs.indexOf(currentSong.src.split(`/${currfolder}/`)[1].split(".mp3")[0].replaceAll("%20", " "))
                //console.log(index)
            if (index - 1 >= 0) {
                playMusic(songs[index - 1])
            }
        }
    });
    next.addEventListener("click", () => {
        if (currentSong.src != '') {
            let index = songs.indexOf(currentSong.src.split(`/${currfolder}/`)[1].split(".mp3")[0].replaceAll("%20", " "))
                //console.log(index)
            if (index + 1 < songs.length) {
                playMusic(songs[index + 1].trim())
            }
        }
    })

    //add ev for vol
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        //console.log(e.target.value)
        currentSong.volume = parseInt(e.target.value) / 100
    })

    //add ev to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
            if (e.target.src.includes("volume.svg")) {
                e.target.src = e.target.src.replace("volume.svg", "mute.svg")
                currentSong.volume = 0;
                document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
            } else {
                e.target.src = e.target.src.replace("mute.svg", "volume.svg")
                currentSong.volume = 0.1;
                document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
            }
        })
        //play next songs automatically and in loop
    currentSong.addEventListener('ended', function() {
        let index = songs.indexOf(currentSong.src.split(`/${currfolder}/`)[1].split(".mp3")[0].replaceAll("%20", " "))
        if (document.querySelector('.loop').getAttribute('src') == 'loop.svg') {
            if (index + 1 < songs.length) {
                playMusic(songs[index + 1].trim())
                play.src = "pause.svg"
            } else {
                play.src = "play.svg"
            }
        } else {
            playMusic(songs[index].trim())
        }
    });
    //add ev to loop svg
    loop.addEventListener("click", e => {
        var loopElement = document.querySelector('.loop');
        if (loopElement.getAttribute('src') === 'loop.svg') {
            loopElement.setAttribute('src', 'oneplay.svg');
        } else {
            loopElement.setAttribute('src', 'loop.svg');
        }

    })

}
main()