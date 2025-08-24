import React from 'react';

interface VisuallyHiddenProps {
  children: React.ReactNode;
  asChild?: boolean;
}

const VisuallyHidden = React.forwardRef<
  HTMLSpanElement,
  VisuallyHiddenProps
>(({ children, asChild = false, ...props }, ref) => {
  const Comp = asChild ? React.Fragment : 'span';
  
  const style = {
    position: 'absolute' as const,
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap' as const,
    border: '0',
  };

  if (asChild) {
    return (
      <>
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<any>, {
                ...props,
                style: { ...style, ...((child.props as any).style || {}) },
                ref,
              })
            : child
        )}
      </>
    );
  }

  return (
    <span ref={ref} style={style} {...props}>
      {children}
    </span>
  );
});

VisuallyHidden.displayName = 'VisuallyHidden';

export { VisuallyHidden };