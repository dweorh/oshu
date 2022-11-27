<template>
  <div class="pt-1">
    <div
      v-if="replyToMessage"
      class="reply-to-message pointer mx-4 mt-1"
      :class="[(sender ? 'sent' : 'received')]"
      @click="$emit('reply-to-message-click', replyToMessage['#'])"
    >
      {{replyToMessage.who}} {{replyToMessage.document.msg}}
    </div>
    <div
      class="message flex flex-col"
      :class="[(sender ? 'sent items-end' : 'received items-start'), (message.document.to ? 'private' : '')]"
      :id="message['#']"
    >
            <!-- :src="'https://avatars.dicebear.com/api/initials/' + message.who + '.svg'" -->
        <div class="flex flex-row">
          <div class="flex flex-wrap items-end mx-1">
            <div v-for="file in files" :key="file.id" class="relative">
              <template v-if="isFileImage(file)">
                <div
                  :style="{'background-image': 'url(' + file.base64 + ')'}"
                  class="uploaded-thumbnail inline-block w-20 h-20"
                  :class="[sender ? 'mr-1' : 'ml-1']"
                  :title="file.name" 
                />
                <div
                  class="w-20 h-20 absolute top-0 left-0 flex items-center font-semibold text-opacity-100 text-transparent cursor-pointer hover:bg-gray-300 hover:bg-opacity-70 hover:text-opacity-0 hover:text-current justify-center"
                  :class="[sender ? 'mr-1' : 'ml-1']"
                  :title="file.name"
                  @click="downloadFile(file)"
                >
                  <span :title="file.name">{{$t('UI.chat.actions.click_to_download')}}</span>
                </div>
              </template>
              <template v-else>
                <div v-if="!isFileImage(file)" class="inline-block">
                  <file-icon
                    :file="file"
                    :filename="true"
                    variant="small" 
                    class="w-14 h-14"
                    :class="[sender ? 'mr-1' : 'ml-1']"
                    @click="downloadFile(file)"
                  />
                </div>
                <div
                  class="w-full h-full text-xs absolute top-0 left-0 flex items-center font-semibold text-opacity-100 text-transparent cursor-pointer hover:bg-gray-300 hover:bg-opacity-90 hover:text-opacity-0 hover:text-current justify-center"
                  :class="[sender ? 'mr-1' : 'ml-1']"
                  :title="file.name"
                  @click="downloadFile(file)"
                >
                  <span :title="file.name">{{$t('UI.chat.actions.click_to_download')}}</span>
                </div>
              </template>
            </div>
          </div>
        </div>
        <div class="flex flex-row w-full">
          <avatar-icon 
            v-if="showAvatars"
            @click="$emit('avatar-click', { who: message.who, alias: message.document.sender.alias, to: message.document.sender.pub, epub: message.document.sender.epub })"
            :title="message.document.sender.alias || message.who"
            :name="message.document.sender.alias || message.who"
            class="pointer"
            alt="avatar"
          />
          <div
            v-if="message.document.msg.length > 0"
            class="message-text"
            :class="{'pr-1 pl-1': !showAvatars}">
              <p
                @click="$emit('message-click', message)"
                class="pointer rounded-md mt-1"
                :class="[(sender ? ' bg-gray-500' : 'bg-gray-300')]"
              >
                {{message.document.msg}}
              </p>
          </div>
        </div>
        <div class="flex flex-row">
          <div class="time m-1">{{ formatTime(message.when) }}</div>
        </div>
    </div>
  </div>
</template>

<script>
import FileIcon from '../icons/FileIcon.vue'
import AvatarIcon from "../icons/AvatarIcon.vue"
// import { createAvatar } from '@dicebear/avatars';
// import * as style from '@dicebear/avatars-initials-sprites';
export default {
    props: {
        sender: {
            type: Boolean,
            default: false,
        },
        message: {
            required: true,
            type: Object
        },
        replyToMessage: {
            required: false,
            type: [Object, Boolean],
            default: false
        },
        showAvatars: {
            required: false,
            type: Boolean,
            default: true
        },
        configuration: {
            type: Object,
            required: false,
            default: () => {
                return {
                    // if storageFetchUrl is not provided sending files will not work
                }
            }
        }
    },
    components: { FileIcon, AvatarIcon },
    emits: ['avatar-click', 'message-click', 'reply-to-message-click'],
    data () {
      return {
        files: []
      }
    },
    created() {
      this.prepareFiles()
    },
    // computed: {
    //   avatar () {
    //     console.log('[style]', style)
    //     return createAvatar(style, {
    //       seed: this.message.who,
    //       backgroundColors: [
    //         '#123456', '#c1c', '#a0a3', 
    //       ],
    //       dataUri: true
    //     });
    //   }
    // },
    methods: {
      downloadFile (file) {
        const downloadLink = document.createElement("a");
        downloadLink.href = file.base64;
        downloadLink.download = file.name;
        downloadLink.click();
      },
      prepareFiles () {
        if (this.message.document.files && this.configuration.storageFetchUrl) {
          let _files = JSON.parse(this.message.document.files)
          Object.keys(_files).forEach(async key => {
            let res = await fetch(this.configuration.storageFetchUrl,{
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ chunks: _files[key].chunks })
            })
            res = await res.json()
            
            const chunks = [];
            // set chunks in the correct order
            _files[key].chunks.forEach(keyChunk => chunks.push( this.str2ab(res.chunks[keyChunk]) ))

            let decrypted = []
            try {
              decrypted = await this.decryptChunks({
                chunks: chunks,
                iv: Uint8Array.from(_files[key].enc.iv.split(',')),
                key: _files[key].enc.key
              })
              // console.log('[decrypted]', decrypted)
            } catch (err) {
              console.error(err)
            }
            this.files.push({
              id: key,
              type: _files[key].type,
              name: _files[key].name,
              base64: this.chunksToBase64({
                chunks: decrypted,
                type: _files[key].type,
                name: _files[key].name,
              })
            })
          })
          // console.log('[files]', _files)
        }
      },
      async decryptChunks(encrypted) {
          const dec = []
          const iv = encrypted.iv
          let key
          try {
            key = await window.crypto.subtle.importKey(
                "jwk", //can be "jwk" or "raw"
                encrypted.key,
                {   //this is the algorithm options
                    name: "AES-GCM",
                },
                false, //whether the key is extractable (i.e. can be used in exportKey)
                ["encrypt", "decrypt"] //can "encrypt", "decrypt", "wrapKey", or "unwrapKey"
            )
          } catch (error) {
            console.error('[decrypt - key]', error)
          }
          // encrypted.chunks.forEach(async chunk => {
          for (let i in encrypted.chunks) {
              let chunk = encrypted.chunks[i]
              try {
                let decrypted = await window.crypto.subtle.decrypt(
                    {
                        name: "AES-GCM",
                        iv: iv, //The initialization vector you used to encrypt
                        // additionalData: ArrayBuffer, //The addtionalData you used to encrypt (if any)
                        tagLength: 128, //The tagLength you used to encrypt (if any)
                    },
                    key, //from generateKey or importKey above
                    chunk //ArrayBuffer of the data
                )
                dec.push(this.ab2str(decrypted))
              } catch (error) {
                console.error('[decrypt]', error, chunk, encrypted.key)
              }
          }
          return dec
      },
      str2ab(str) {
          return Uint8Array.from(atob(str), c => c.charCodeAt(0))
      },
      ab2str(buf) {
          return buf instanceof ArrayBuffer 
              ? btoa(String.fromCharCode.apply(null, new Uint8Array(buf)))
              : btoa(String.fromCharCode.apply(null, buf))
      },
      chunksToBase64(file) {
        return 'data:' + file.type + ';base64,' + file.chunks.join('')  
      //   return 'data:' + file.type + ';base64,' + file.chunks.join('')
      },
      formatTime (ts) {
        let now = new Date()
        let tsDate = new Date(ts)

        if (now.getDate() == tsDate.getDate() && now.getMonth() == tsDate.getMonth() && now.getFullYear() == tsDate.getFullYear()) {
          return tsDate.toLocaleString(
            undefined,{
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric'
            })
        }
        return tsDate.toLocaleString(
          undefined,{
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
          })
      },
      isFileImage(file) {
        return file.type.match(/^image\//)
      }
    }
}
</script>

<style scoped>
  p {
    max-width: 90%;
    min-width: 2em;
    margin-bottom: 0;
    line-height: 1.125;
    font-size: 0.85em;
    padding: 0.375em;
    /* border-radius: 0.5rem; */
    position: relative;
    color: white;
    text-align: center;
  }

  .pointer {
    cursor: pointer;
  }
  
  .message {
    display: flex;
    /* align-items: self-start; */
    margin: 0;
    word-wrap: break-word;
  }
    
  .sent {
    /* flex-direction: row-reverse; */
    /* align-items: self-end; */
  }
  
  .sent p {
    color: white;
    /* background: rgb(58, 58, 58); */
    align-self: flex-end;
    text-align: right;
  }

  .received p {
    /* background: #e5e5ea; */
    color: black;
    text-align: left;
  }

  .private p {
    font-style: italic;
  }

  .message-text {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    width: 100%;
    overflow: hidden;
  }

  .received .message-text {
    align-items: flex-start;
  }

  .time {
    font-size: 0.7em;
    color: #222;
    /* margin: 0 0.25em; */
    line-height: 1em;
  }

  img {
    width: 2em;
    height: 2em;
    border-radius: 50%;
    margin: 2px 5px;
  }

  .reply-to-message {
    font-size: 0.7em;
    color: #222;
    /* margin: 1rem 1rem 0.125rem 1rem; */
    line-height: 0.8em;
    text-align: left;
    display: flex;
  }

  .uploaded-thumbnail {
    /* width: 100%;
    height: 100%; */
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }
</style>