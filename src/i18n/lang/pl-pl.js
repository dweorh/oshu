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
        default_room: 'Główny',
        type_message: 'Wpisz wiadomość...',
        type_message_or_drop_file: "Wpisz wiadomość lub przeciągnij plik",
        send_message: 'Wyślij wiadomość',
        priv_to: 'Priv to',
        hello: 'Cześć',
        sign_out: 'Wyloguj',
        login: 'Zaloguj',
        sign_up: 'Zarejestruj',
        sign_up_operator: 'Zarejestruj operatora',
        username: 'Nazwa użytkownika',
        credentials: 'Dane logowania',
        operators_pub: 'Operator\'s .pub',
        operators_enc_keys: 'Main Operator\'s encryption keys',
        colapse: 'Zwiń',
        expand: 'Rozwiń',
        rooms: 'Pokoje',
        calls: 'Połączenia',
        pending: 'Oczekujące',
        welcome_public: 'Cześć',
        pobox: 'Poczta',
        copied_to_clipboard: 'Skopiowane do schowka',
        request_new_pobox: 'Zamów nową skrzynkę',
        click_to_copy: 'Kliknij by skopować do schowka',
        registration_link: 'Kliknij żeby skopiować link do rejestracji',
        thank_you: 'Dziękujemy!',
        actions: {
          switch_user: 'Zmień użytkownika',
          export_credentials: 'Eksport danych logowania',
          export_contacts: 'Eksport kontaktów',
          copy_id: 'Skopiuj swoje ID',
          add_contact: 'Dodaj kontakt',
          import_contacts: 'Importuj kontakty',
          sign_out: 'Wyloguj',
          settings: 'Opcje',
          minimalize: 'Minimalizuj',
          close: 'Zamknij',
          make_call: 'Połącz',
          upload: 'Wgraj plik',
          remove: 'Usuń',
          click_to_download: 'Pobierz'
        },
        paste_contact_id: 'Wklej ID kontaktu',
        contact_alias: 'Nazwa kontaktu',
        paste_credentials: 'Wklej dane logowania',
        add_contact_invitation_sent: 'Zaproszenie wysłane',
        call_initialized: 'Połączenie zainicjalizowane',
        create_account: 'Utwórz nowe konto',
        errors: {
          title: 'Błąd',
          something_went_wrong: 'Uppsss... coś poszło nie tak :/',
          file_too_big: 'Plik jest za duży, maksymalny rozmiar to: {size}MB.',
          file_not_image: 'Plik musi być obrazem.',
          file_no_storage: 'Przesyłanie plików jest niedostępne.'
        },
        loading: 'Ładowanie...',
        registration: {
          admin_title: 'Rejestracje',
          form_title: 'Formularz rejestrcyjny',
          no_authority: 'Nie udało znaleźć się rejestratora',
          name: 'Imię',
          phone: 'Numer telefonu',
          email: 'E-mail',
          submit: 'Zarejestruj',
          register: 'Zaakceptuj',
          reject: 'Odrzuć',
          form_sent: 'Formularz rejestracyjny został przesłany.',
          password: 'Hasło (min. 8 znaków)',
          password_confirm: 'Powtórz hasło',
        },
        authentication: {
          form_title: 'Logowanie',
          submit: 'Zaloguj'
        }
      }
    }
  }
}
