// import dateFormat from 'dateformat'
import { History } from 'history'
// import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Image,
  Form,
  Segment,
} from 'semantic-ui-react'
// import { Form} from 'react-bootstrap';
import { createBook, deleteBook, getBooks, patchBook } from '../api/books-api'
import Auth from '../auth/Auth'
import { Book } from '../types/Book'

interface BooksProps {
  auth: Auth
  history: History
}

interface BooksState {
  books: Book[]
  newBookName: string
  newBookAuthor: string
  newBookQuantity: number
  newBookPrice: number
  isEdit : boolean
  bookId: string
}

export class Books extends React.PureComponent<BooksProps, BooksState> {
  state: BooksState = {
    books: [],
    newBookName: '',
    newBookAuthor: '',
    newBookQuantity: 0,
    newBookPrice: 0,
    isEdit : false,
    bookId: ''
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBookName: event.target.value })
  }

  handleAuthorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBookAuthor: event.target.value })
  }
  handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBookQuantity: Number(event.target.value) })
  }
  handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBookPrice: Number(event.target.value) })
  }

  onUploadButtonClick = (bookId: string) => {
    this.props.history.push(`/books/${bookId}/edit`)
  }
  onBookCreate = async () => {
    console.log("check")
    try {
      if (!this.state.newBookName.trim() || !this.state.newBookAuthor.trim()) {
        throw Error("Book name and author must not empty");
      }
      if (Number(this.state.newBookPrice) < 0 || Number(this.state.newBookQuantity) < 0) {
        throw Error("Price and Quantity must at least 0");
      }
      // const dueDate = this.calculateDueDate()
      const newBook = await createBook(this.props.auth.getIdToken(), {
        name: this.state.newBookName,
        author: this.state.newBookAuthor,
        quantity: this.state.newBookQuantity,
        price: this.state.newBookPrice
      })
      console.log(newBook)
      this.setState({
        books: [...this.state.books, newBook],
        newBookName: '',
        newBookAuthor: '',
        newBookQuantity: 0,
        newBookPrice: 0,
        isEdit : false,
        bookId : ''
      })
      alert(`Book creation successed`)
      console.log("demo2")
    } catch (e) {
      alert(`Book creation failed ${e}`)
    }
  }

  onBookDelete = async (bookId: string) => {
    try {
      await deleteBook(this.props.auth.getIdToken(), bookId)
      this.setState({
        books: this.state.books.filter(book => book.bookId !== bookId)
      })
    } catch {
      console.log("this.state.books", this.state.books)
      alert('Book deletion failed')
    }
  }

  onEditButtonClick = async (bookId: string) => {
    var edit_book = await this.state.books.find(book => book.bookId === bookId)
    if(edit_book){
      this.setState({
        books: [...this.state.books],
        newBookName: edit_book.name,
        newBookAuthor: edit_book.author,
        newBookQuantity: edit_book.quantity,
        newBookPrice: edit_book.price,
        isEdit: true,
        bookId : bookId
      });
    }
    else{
      alert('Failed');
    }
  }

  onBookEdit= async () => {
    try {
      await patchBook(this.props.auth.getIdToken(), this.state.bookId, {
        name: this.state.newBookName,
        author: this.state.newBookAuthor,
        quantity: this.state.newBookQuantity,
        price: this.state.newBookPrice
      });
      this.setState({
        books: this.state.books,
        newBookName: '',
        newBookAuthor: '',
        newBookQuantity: 0,
        newBookPrice: 0,
        isEdit: false,
        bookId : ''
      });
      alert(`Book updated`)
    } catch {
      alert('Book updation failed')
    }
  }

  async componentDidMount() {
    try {
      const books = await getBooks(this.props.auth.getIdToken())
      this.setState({
        books
      })
    } catch (e) {
      let error_message = 'Failed to fetch Books'
      if (e instanceof Error) {
        error_message = e.message
      }
      alert(error_message)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Books</Header>
       <Grid columns={2}>
       <Grid.Row>
        <Grid.Column width={11}>
            {this.renderBooksList()}
          </Grid.Column>
          <Grid.Column width={1}>
          </Grid.Column>
          <Grid.Column width={4}>
            {this.renderCreateBookInput()}
          </Grid.Column>
        </Grid.Row>
       </Grid>

      </div>
    )
  }

  renderCreateBookInput() {
    return (
      <Grid>
        <Segment inverted>
          <Form inverted>
            <Form.Field>
              <label>Book Name</label>
              <input placeholder='Enter ...' value={this.state.newBookName} onChange={this.handleNameChange} />
            </Form.Field>
            <Form.Field>
              <label>Book Author</label>
              <input placeholder='Enter ...' value={this.state.newBookAuthor} onChange={this.handleAuthorChange} />
            </Form.Field>
            <Form.Field>
              <label>Book Quantity</label>
              <input placeholder='Enter ...' type='Number' value={this.state.newBookQuantity} onChange={this.handleQuantityChange} />
            </Form.Field>
            <Form.Field>
              <label>Book Price</label>
              <input placeholder='Enter ...' value={this.state.newBookPrice} onChange={this.handlePriceChange} />
            </Form.Field>
            {!this.state.isEdit ? <Button onClick={() => this.onBookCreate()}>Submit</Button> : <Button onClick={() => this.onBookEdit()}>Update</Button>
            }
          </Form>
        </Segment>
      </Grid>
    )
  }

  renderBooksList() {
    return (
      <Grid padded>
        {this.state.books?.map((book) => {
          return (
            <Grid.Row key={book.bookId}>
              <Grid.Column width={5} >
                Name: {book.name}
              </Grid.Column>
              <Grid.Column width={3} >
                Author: {book.author}
              </Grid.Column>
              <Grid.Column width={3} >
                Quantity: {book.quantity}
              </Grid.Column>
              <Grid.Column width={2} >
                Price: {book.quantity} $
              </Grid.Column>
              <Grid.Column width={1} >
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(book.bookId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onUploadButtonClick(book.bookId)}
                >
                  <Icon name="upload" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onBookDelete(book.bookId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {book.attachmentUrl && (
                <Image src={book.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
