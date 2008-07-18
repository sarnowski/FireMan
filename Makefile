include package.conf

all: package


generate:
	@scripts/generate.sh package.conf && \
	cd $(BUILDDIR)/chrome && \
	../../scripts/generate_jar.sh fireman.jar

package: generate
	@cp LICENSE $(BUILDDIR)/ && \
	cd $(BUILDDIR) && \
	../scripts/generate_xpi.sh ../$(APPNAME).xpi fireman.jar

clean:
	rm -rf build

distclean: clean
	rm -f $(APPNAME).xpi
