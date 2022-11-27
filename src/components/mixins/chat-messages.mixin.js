/* global SEA */
/* global GUN */
const data = function() {
    return {
        messages: {},
        priv_to: false,
        reply_to: false
    }
}
const methods = {
    fetchMessages (roomId, room, roomKeys, roomAllKeys) {
      console.log('[fetch messages]', roomId, room, roomKeys, roomAllKeys)
        // var match = {
        //   // lexical queries are kind of like a limited RegEx or Glob.
        //   '.': {
        //     // property selector
        //     '>': new Date(+new Date() - 1 * 1000 * 60 * 60 * 3).toISOString(), // find any indexed property larger ~3 hours ago
        //   },
        //   '-': 1, // filter in reverse
        // };
        //this.chat // .get(db_name)
  
        
        room.map(function(data) {
          // console.log('[room map]', this)
            // console.log('[mapper]', value)
            // return new Error('stop' + data)
            return data
        })
        .once(async (data) => {
            // console.log('[chat]', data)
            if (data && data.document) {
              // Key for end-to-end encryption
              Promise.all([
                SEA.decrypt(data.document, roomKeys)
              ]).then(async (values) => {
                // this.gun.user(data).once(console.log)
                let message = {
                  '#': data._['#'],
                  document: values[0],
                  when: GUN.state.is(data, 'document'), // get the internal timestamp for the what property.
                };
                if (message.document && typeof message.document == 'object') {
                  message.who = message.document.sender?.pub
                  if (message.document.to) { // private message
                    if (message.who == this.userMeta.credentials.pub) {
                      message.document.msg = await SEA.decrypt(message.document.msg, await SEA.secret(message.document.to.epub, this.auth.sea));
                    } else if (message.document.to.pub == this.auth.sea.pub) {
                      message.document.msg = 
                        await SEA.decrypt(message.document.msg,
                          await SEA.secret(message.document.sender.epub, this.auth.sea)
                        );
                    } else {
                      return
                    }
                  }
                  this.messages[roomId] = [...this.messages[roomId].slice(-100), message].sort((a, b) => a.when - b.when);
                  if (this.canAutoScroll) {
                    this.autoScroll();
                  } else {
                    this.unreadMessages = true;
                  }
                }
              }).catch(error => {
                console.info('[Promise.all]', error, data, this.gun.user(data))
              })
            }
        });
    },
    privMessage(to) {
      if (!to || (this.priv_to && this.priv_to.to === to.to)) {
        this.priv_to = false
      } else {
        this.track('priv-message')
        this.priv_to = to;
        this.replyTo(false)
      }
    },
    replyTo(message){ 
      if (!message.document || (this.reply_to && this.reply_to['#'] === message['#'])) {
        this.reply_to = false
      } else {
        this.track('reply-to')
        this.reply_to = message;
        this.privMessage(false)
      }
    },
    messageSent() {
      this.track('message-sent')
      this.privMessage(false)
      this.replyTo(false)
      this.canAutoScroll = true
    },
    fileSent(event) {
      this.track('file-sent', event)
    }
}

export default {
    methods, data
}