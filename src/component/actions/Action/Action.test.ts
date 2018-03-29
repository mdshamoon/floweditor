import { getTypeConfig } from '../../../config';
import { createSetup, getSpecWrapper } from '../../../testUtils';
import { getLanguage, getLocalization } from '../../../utils';
import {
    actionContainerSpecId,
    actionOverlaySpecId,
    ActionWrapper,
    ActionWrapperProps,
    actionInteractiveDivSpecId,
    actionBodySpecId
} from './Action';

const config = require('../../../../assets/config');
const colorsFlowResp = require('../../../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json');

const {
    results: [{ definition: { nodes: [sendMsgNode, , , sendMsgNode1, , , startFlowNode] } }]
} = colorsFlowResp;
const { actions: [sendMsgAction] } = sendMsgNode;
const { actions: [sendMsgAction1] } = sendMsgNode1;
const { actions: [startFlowAction] } = startFlowNode;

const context = {
    languages: config.languages
};

const english = getLanguage(config.languages, 'eng');
const spanish = getLanguage(config.languages, 'spa');

const baseProps = {
    thisNodeDragging: false,
    localization: colorsFlowResp.results[0].definition.localization,
    first: true,
    action: sendMsgAction,
    render: jest.fn(),
    node: sendMsgNode,
    language: english,
    translating: false,
    onOpenNodeEditor: jest.fn(),
    removeAction: jest.fn(),
    moveActionUp: jest.fn()
};

const setup = createSetup<ActionWrapperProps>(ActionWrapper, baseProps, context);

const COMPONENT_TO_TEST = ActionWrapper.name;

describe(`${COMPONENT_TO_TEST}`, () => {
    describe('render', () => {
        it('should render self, children with base props', () => {
            const { wrapper, props: { action, render: renderMock } } = setup(
                { render: jest.fn() },
                true
            );
            const ActionWrapperInstance = wrapper.instance();
            const { name } = getTypeConfig(action.type);
            const expectedClasses = 'action';
            const actionToInject = action;
            const titleBarClass = action.type;
            const showRemoval = true;
            const showMove = false;
            const actionContainer = getSpecWrapper(wrapper, actionContainerSpecId);

            expect(actionContainer.prop('id')).toBe(`action-${action.uuid}`);
            expect(actionContainer.hasClass(expectedClasses)).toBeTruthy();
            expect(getSpecWrapper(wrapper, actionOverlaySpecId).hasClass('overlay')).toBeTruthy();
            expect(getSpecWrapper(wrapper, actionInteractiveDivSpecId).exists()).toBeTruthy();
            expect(wrapper.find('TitleBar').props()).toEqual({
                __className: action.type,
                title: name,
                onRemoval: ActionWrapperInstance.onRemoval,
                showRemoval,
                showMove,
                onMoveUp: ActionWrapperInstance.onMoveUp
            });
            expect(getSpecWrapper(wrapper, actionBodySpecId).hasClass('body')).toBeTruthy();
            expect(renderMock).toHaveBeenCalledTimes(1);
            expect(renderMock).toHaveBeenCalledWith(action);
        });

        it('should show move icon', () => {
            const { wrapper } = setup({ first: false }, true);

            expect(wrapper.find('TitleBar').prop('showMove')).toBeTruthy();
        });

        it('should display translating style', () => {
            const { wrapper } = setup({ translating: true }, true);

            expect(
                getSpecWrapper(wrapper, actionContainerSpecId).hasClass('translating')
            ).toBeTruthy();
        });

        it('should display not_localizable style', () => {
            const { wrapper } = setup({ action: startFlowAction, translating: true }, true);

            expect(
                getSpecWrapper(wrapper, actionContainerSpecId).hasClass('not_localizable')
            ).toBeTruthy();
        });

        it('should display hybrid style', () => {
            const { wrapper } = setup({ node: startFlowNode }, true);

            expect(
                getSpecWrapper(wrapper, actionContainerSpecId).hasClass('has_router')
            ).toBeTruthy();
        });

        it('should display missing_localization style', () => {
            const { wrapper } = setup({ action: sendMsgAction1, translating: true }, true);

            expect(
                getSpecWrapper(wrapper, actionContainerSpecId).hasClass('missing_localization')
            ).toBeTruthy();
        });
    });

    describe('instance methods', () => {
        describe('onClick', () => {
            it('should be called when interactive div is clicked', () => {
                const onClickSpy = jest.spyOn(ActionWrapper.prototype, 'onClick');
                const { wrapper } = setup({}, true);
                const interactiveDiv = getSpecWrapper(wrapper, actionInteractiveDivSpecId);
                const mockEvent = {
                    preventDefault: jest.fn(),
                    stopPropagation: jest.fn()
                };

                interactiveDiv.simulate('mouseDown', mockEvent);
                interactiveDiv.simulate('mouseUp', mockEvent);

                expect(onClickSpy).toHaveBeenCalledTimes(1);
                expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
                expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1);

                onClickSpy.mockRestore();
            });

            it("should call 'onOpenEditor' action creator if node is not dragging", () => {
                const {
                    wrapper,
                    props: { onOpenNodeEditor: onOpenNodeEditorMock, node, action },
                    context: { languages }
                } = setup({ onOpenNodeEditor: jest.fn() }, true);
                const ActionWrapperInstance = wrapper.instance();
                const mockEvent = {
                    preventDefault: jest.fn(),
                    stopPropagation: jest.fn()
                };

                ActionWrapperInstance.onClick(mockEvent);

                expect(onOpenNodeEditorMock).toHaveBeenCalledTimes(1);
                expect(onOpenNodeEditorMock).toHaveBeenCalledWith(node, action, languages);
            });
        });

        describe('onRemoval', () => {
            it('should call removeAction action creator', () => {
                const { wrapper, props: { removeAction: removeActionMock, action, node } } = setup(
                    { removeAction: jest.fn() },
                    true
                );
                const ActionWrapperInstance = wrapper.instance();
                const mockEvent = {
                    stopPropagation: jest.fn()
                };

                ActionWrapperInstance.onRemoval(mockEvent);

                expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1);
                expect(removeActionMock).toHaveBeenCalledTimes(1);
                expect(removeActionMock).toHaveBeenCalledWith(node.uuid, action);
            });
        });

        describe('onMoveUp', () => {
            it('should call moveActionUp action creator', () => {
                const { wrapper, props: { moveActionUp: moveActionUpMock, action, node } } = setup(
                    { moveActionUp: jest.fn() },
                    true
                );
                const ActionWrapperInstance = wrapper.instance();
                const mockEvent = {
                    stopPropagation: jest.fn()
                };

                ActionWrapperInstance.onMoveUp(mockEvent);

                expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1);
                expect(moveActionUpMock).toHaveBeenCalledTimes(1);
                expect(moveActionUpMock).toHaveBeenCalledWith(node.uuid, action);
            });
        });

        describe('getAction', () => {
            it('should return the action passed via props if not localized', () => {
                const { wrapper, props: { action } } = setup({ node: sendMsgAction1 }, true);
                const ActionWrapperInstance = wrapper.instance();

                expect(ActionWrapperInstance.getAction()).toEqual(action);
            });

            it('should return localized action if localized', () => {
                const {
                    wrapper,
                    props: { action, localization, language: { iso } },
                    context: { languages }
                } = setup({}, true);
                const ActionWrapperInstance = wrapper.instance();
                const localizedObject = getLocalization(
                    action,
                    localization,
                    iso,
                    languages
                ).getObject();

                expect(ActionWrapperInstance.getAction()).toEqual(localizedObject);
            });
        });
    });
});
