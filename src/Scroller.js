import React from 'react';
import './Scroller.css';
import { throttle } from 'throttle-debounce';


class Scroller extends React.Component {
	constructor(props) {
		super(props);
		this.$innerWrapper = React.createRef();
		this.$spacer = React.createRef();
		this.state = {
			itemsPerPage: 500,
			startPageIdx: 0,
			endPageIdx: 3,
			thresholdMultiplier: 2.1
		}
		this.handleScrollEvt = throttle(10, this.handleScrollEvt.bind(this));
	}
	handleScrollEvt(evt) {
		const innerWrapperRect = this.$innerWrapper.current.getBoundingClientRect();
		const mainEl = this.$innerWrapper.current.parentElement.parentElement;


		const distanceToBottom = innerWrapperRect.bottom - mainEl.clientHeight;


		const isGoingDown = mainEl.scrollTop > this.lastScrollTopPos;

		this.lastScrollTopPos = mainEl.scrollTop;

		if(isGoingDown) {
			const isCloseToEndOfList = distanceToBottom < this.threshold;
			const tooMuchOnTop = Math.abs(innerWrapperRect.top) > this.threshold;
			if(isCloseToEndOfList) {
				console.log('----------------------adding a page to the bottom');
				const isAlreadyAtTheEnd = this.state.endPageIdx === this.maxPages;
				if(!isAlreadyAtTheEnd) {
					this.setState({
						endPageIdx: this.state.endPageIdx + 1
					});
				}
			} else if(tooMuchOnTop) {
				console.log('----------------------removing a page from the top');
				this.setState({
					startPageIdx: this.state.startPageIdx + 1,
				});
			}
		} else {
			const isTooMuchOnTheBottom = distanceToBottom > this.threshold;
			const isCloseToTheBegining  = Math.abs(innerWrapperRect.top) < this.threshold;
			if(isTooMuchOnTheBottom) {
				console.log('----------------------removing a page from the bottom');
				this.setState({
					endPageIdx: this.state.endPageIdx - 1
				});
			} else if(isCloseToTheBegining) {
				const isAlreadyAtTheTop = this.state.startPageIdx === 0;
				if(isAlreadyAtTheTop) {
					return;
				}
				console.log('----------------------adding a page to the top');
				this.setState({
					startPageIdx: this.state.startPageIdx - 1,
				});
			}
		}
	}
	getWrapperHeight() {
		return this.$innerWrapper.current.clientHeight;
	}
	componentDidMount() {
		this.currSpacerHeight = 0;
		this.lastScrollTopPos = 0;
		this.buestGuessTotalHeight();
	}
	// after things are mounted take the best guess set the height
	// so the scrollbar is atleast somewhat accurate
	buestGuessTotalHeight() {
		const numPagesShown = this.state.endPageIdx - this.state.startPageIdx;
		const currHeightOfElementsShown = this.$innerWrapper.current.clientHeight;
		const approxHeightPerPage = currHeightOfElementsShown / numPagesShown;
		// this will help us in knowing when to add and remove elements
		this.threshold = approxHeightPerPage * this.state.thresholdMultiplier;
		const numTotalPages = this.props.children.length / this.state.itemsPerPage;
		this.maxPages = Math.ceil(numTotalPages);
		const approxSizeOfWholeList = numTotalPages * approxHeightPerPage;
		this.$innerWrapper.current.parentElement.style.height = approxSizeOfWholeList + 'px';
	}
	getSnapshotBeforeUpdate(prevProps, prevState) {
		return this.$innerWrapper.current.clientHeight;
	}
	componentDidUpdate(prevProps, prevState, oldScrollerHeight) {
		const newScrollerHeight = this.$innerWrapper.current.clientHeight;
		const diff = oldScrollerHeight - newScrollerHeight;
		// if the height of the inner wrapper has changed, and we've changed the start page,
		// let's update the spacer at the top to accomodate those changes, and save the information
		const shouldUpdate = diff !== 0 && this.state.startPageIdx !== prevState.startPageIdx;
		console.log('Diff between oldScrollerHeight', diff);
		if(!shouldUpdate) {
			return;
		}

		this.currSpacerHeight += diff;
		
		// FIXME probably an anti pattern with react
		// should probably be moved to the render.
		// Have to experiment with that.
		this.$spacer.current.style.height = this.currSpacerHeight + 'px';
	}
	render() {
		const startElemIdx = this.state.startPageIdx * this.state.itemsPerPage;
		const endElemIdx = this.state.endPageIdx * this.state.itemsPerPage;
		const visibleSubSection = this.props.children.slice(startElemIdx, endElemIdx);
		return (
			<div className="scroller" onScroll={this.handleScrollEvt}>
				<div>
					<div className="spacer" ref={this.$spacer}></div>
					<div className="inner_wrapper" ref={this.$innerWrapper}>
						{visibleSubSection}
					</div>
				</div>
			</div>
		);
	}
}


export default Scroller;
