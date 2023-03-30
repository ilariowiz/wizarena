import React, { Component } from 'react';
import '../../css/Modal.css'
import '../../css/ItemCard.css'
import recipeBook from './RecipeBook'


const linguetta_on = require('../../assets/linguetta_on.png')
const linguetta_off = require('../../assets/linguetta_off.png')
const close_book = require('../../assets/close_book.png')

const orn_bottom_left = require('../../assets/orn_bottom_left.png')
const orn_bottom_right = require('../../assets/orn_bottom_right.png')
const orn_top_left = require('../../assets/orn_top_left.png')
const orn_top_right = require('../../assets/orn_top_right.png')

class ModalRecipeBook extends Component {
    constructor(props) {
        super(props)

        let capitoli = {}
        recipeBook.map(i => {
            if (!capitoli[i.stat]) {
                capitoli[i.stat] = []
            }

            capitoli[i.stat].push(i)
        })

        this.state = {
            capitoli,
            capitoloSelected: 'HP'
        }
    }

    renderSegnalibro(key) {
        const { capitoloSelected } = this.state
        const { isMobile } = this.props

        let width = isMobile ? 74 : 114
        let height = isMobile ? 40 : 66

        return (
            <button
                style={{ width, height, position: 'relative', marginBottom: 5, justifyContent: 'center', alignItems: 'center', display: 'flex', cursor: 'pointer' }}
                key={key}
                onClick={() => this.setState({ capitoloSelected: key })}
            >
                <img
                    src={key === capitoloSelected ? linguetta_on : linguetta_off}
                    style={{ width, height }}
                    alt='bookmark'
                />

                <p style={{ fontSize: isMobile ? 13 : 17, color: key === capitoloSelected ? 'white' : '#f4b6b6', position: 'absolute', marginLeft: isMobile ? 16 : 24 }}>
                    {key.toUpperCase()}
                </p>
            </button>
        )
    }

    renderItem(item, index) {
        return (
            <div style={styles.card} key={index}>
                <img
                    src={item.url}
                    style={{ width: 90, height: 90, marginBottom: 5 }}
                    alt='result'
                />
                <p style={{ fontSize: 17, color: "#542510", textAlign: 'center', marginBottom: 15 }}>
                    {item.name}
                </p>

                <p style={{ fontSize: 17, color: '#542510', marginBottom: 15 }}>
                    INGREDIENTS:
                </p>

                <p style={{ fontSize: 16, color: '#542510', marginBottom: 5 }}>
                    1) {item.wiza} $WIZA
                </p>

                <div style={{ alignItems: 'center' }}>
                    <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                            src={item.ingredientsInfo[0].url}
                            style={{ width: 60 }}
                            alt='ingredient'
                        />
                        <p style={{ fontSize: 15, color: '#542510', textAlign: 'center' }}>
                            2) {item.ingredientsInfo[0].name}
                        </p>
                    </div>

                    <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                            src={item.ingredientsInfo[1].url}
                            style={{ width: 60 }}
                            alt='ingredient'
                        />
                        <p style={{ fontSize: 15, color: '#542510', textAlign: 'center' }}>
                            3) {item.ingredientsInfo[1].name}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

	render() {
		const { showModal, isMobile } = this.props;
        const { capitoli, capitoloSelected } = this.state

		const classContainer = showModal ? "containerPopup" : "hidePopup"

        let height = window.innerHeight * 80 / 100
        let width = window.innerWidth * 80 / 100
        if (height > 470) {
            height = 470
        }

        if (width > 840) {
            width = 840
        }

		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { width, height })}>

                    <p style={{ color: '#542510', fontSize: 28, textDecoration: 'underline' }}>
                        Recipes
                    </p>

                    <div style={{ flexDirection: 'column', position: 'absolute', width: 40, left: isMobile ? -30 : -90, top: 30 }}>
                        {Object.keys(capitoli).map((item, index) => {
                            return this.renderSegnalibro(item, index)
                        })}
                    </div>

                    <div style={{ flexWrap: 'wrap', marginLeft: 100, marginRight: 100, justifyContent: 'center', alignItems: 'center', marginBottom: 10, height: '100%', width: '100%', overflow: 'auto' }}>
                        {capitoli[capitoloSelected].map((item, index) => {
                            return this.renderItem(item, index)
                        })}
                    </div>

                    <img
                        src={orn_bottom_left}
                        style={{ position: 'absolute', bottom: -18, left: -18, width: 46, height: 50 }}
                        alt='decoration'
                    />

                    <img
                        src={orn_bottom_right}
                        style={{ position: 'absolute', bottom: -18, right: -18, width: 46, height: 50 }}
                        alt='decoration'
                    />

                    <img
                        src={orn_top_left}
                        style={{ position: 'absolute', top: -18, left: -18, width: 46, height: 50 }}
                        alt='decoration'
                    />

                    <img
                        src={orn_top_right}
                        style={{ position: 'absolute', top: -18, right: -18, width: 46, height: 50 }}
                        alt='decoration'
                    />

                    <button
                        style={Object.assign({}, styles.btnClose, { right: isMobile ? 3 : 25 })}
                        onClick={() => {
                            this.props.onCloseModal()
                        }}
                    >
                        <img
                            src={close_book}
                            style={{ width: 50, height: 70 }}
                            alt='close'
                        />

                        <p style={{ fontSize: 24, color: 'white', position: 'absolute', lineHeight: 1, marginBottom: 10, marginLeft: 4 }}>
                            X
                        </p>

                    </button>
				</div>
			</div>
		)
	}
}


const styles = {
	subcontainer: {
		backgroundColor: "#e8b796",
		borderRadius: 2,
		borderColor: "#a22634",
		borderStyle: 'solid',
        borderWidth: 8,
		//justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
		position: 'relative',
        padding: 15
	},
    btnChoose: {
        minHeight: 40,
        height: 40,
        width: 150,
        minWidth: 100,
        marginBottom: 15,
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#e53b44"
    },
    card: {
        width: 200,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 2,
        borderWidth: 2,
        borderColor: '#c28569',
        borderStyle: 'solid',
        marginRight: 10,
        marginLeft: 10,
        marginBottom: 20,
        height: 'fit-content'
    },
    btnClose: {
        position: 'absolute',
        top: -19,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }
}

export default ModalRecipeBook;
