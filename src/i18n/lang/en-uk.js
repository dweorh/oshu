export default {
  numberFormats: {
    currency: {
      style: 'currency', currency: 'USD', currencyDisplay: 'symbol'
    }
  },
  formatters: {
    datetime: {
      date: {
        year: 'numeric', month: '2-digit', day: '2-digit'
      },
      datemedium: {
        year: 'numeric', month: 'short', day: '2-digit'
      },
      short: {
        month: 'short', day: '2-digit'
      },
      mediumshort: {
        month: 'short', day: '2-digit', weekday: 'short'
      },
      medium: {
        year: 'numeric', month: 'short', day: '2-digit', weekday: 'short'
      },
      long: {
        year: 'numeric', month: 'short', day: '2-digit', weekday: 'short', hour: 'numeric', minute: 'numeric'
      },
      datetime: {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric'
      }
    }
  },
  translations: {
    UI: {
      chat: {
        default_room: 'Dashboard',
        type_message: 'Type a message...',
        type_message_or_drop_file: "Type a messsage or drop a file",
        send_message: 'Send a message',
        priv_to: 'Priv to',
        hello: 'Hello',
        sign_out: 'Sign out',
        login: 'Login',
        sign_up: 'Sign Up',
        sign_up_operator: 'Sign Up Operator',
        username: 'Username',
        credentials: 'Credentials',
        operators_pub: 'Operator\'s .pub',
        operators_enc_keys: 'Main Operator\'s encryption keys',
        colapse: 'Colapse',
        expand: 'Expand',
        rooms: 'Rooms',
        groups: 'Groups',
        calls: 'Calls',
        pending: 'Pending',
        welcome_public: 'Welcome',
        pobox: 'P.O. Box',
        copied_to_clipboard: 'Copied To Clipboard',
        request_new_pobox: 'Request New P.O. Box',
        click_to_copy: 'Click to copy to clipboard',
        registration_link: 'Click here to copy the registration link',
        thank_you: 'Thank you!',
        actions: {
          switch_user: 'Switch User',
          export_credentials: 'Export Login Credentials',
          export_contacts: 'Export Contacts',
          copy_id: 'Copy Your ID',
          add_contact: 'Add Contact',
          import_contacts: 'Import contacts',
          sign_out: 'Sign Out',
          settings: 'Settings',
          minimalize: 'Minimalize',
          close: 'Close',
          make_call: 'Make a Call',
          upload: 'Upload File',
          remove: 'Remove',
          click_to_download: 'Click to download'
        },
        paste_contact_id: 'Paste contact ID',
        contact_alias: 'Contact alias',
        paste_credentials: 'Paste credentials here',
        add_contact_invitation_sent: 'Invitation was sent',
        call_initialized: 'Call initialized',
        create_account: 'Create a New Account',
        errors: {
          title: 'Error',
          something_went_wrong: 'Uppsss... something went wrong :/',
          file_too_big: 'File is too big, max size is {size}MB.',
          file_not_image: 'File must be an image.',
          file_no_storage: 'Uploading files is not available.'
        },
        loading: 'Loading...',
        registration: {
          admin_title: 'Registrations',
          form_title: 'Registration Form',
          no_authority: 'We can\'t find the Registration Authority.',
          name: 'Name',
          phone: 'Phone number',
          email: 'E-mail',
          submit: 'Register',
          register: 'Accept',
          reject: 'Reject',
          form_sent: 'Your registration form was sent.',
          password: 'Password (min. 8 characters)',
          password_confirm: 'Confirm password'
        },
        authentication: {
          form_title: 'Login',
          submit: 'Login'
        }
      }
    }
  }
}
