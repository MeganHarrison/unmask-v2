export function ChatBubbleExample() {
  return (
    <>
      <div className="chat chat-receiver">
        <div className="chat-bubble">Just finished my first painting!</div>
        <div className="chat-footer text-base-content/50">
          <div>Delivered</div>
        </div>
      </div>
      <div className="chat chat-sender">
        <div className="chat-bubble">That&apos;s amazing! I&apos;d love to see it!</div>
        <div className="chat-footer text-base-content/50">
          Seen
          <span className="icon-[tabler--checks] text-success align-bottom"></span>
        </div>
      </div>
    </>
  );
}